const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

module.exports = (io) => {
  // Authenticate every socket connection via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: No token'));

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error('Server misconfiguration'));
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?.id})`);

    socket.on('join_complaint', async (complaintId) => {
      socket.join(complaintId);

      try {
        const messages = await Message.find({ complaintId })
          .populate('senderId', 'name role type')
          .sort('createdAt');
        socket.emit('chat_history', messages);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        socket.emit('error', { message: 'Failed to load chat history' });
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { complaintId, message } = data;
        // Use the authenticated user's ID from the token, not from client data
        const senderId = socket.user.id;

        const newMessage = new Message({
          complaintId,
          senderId,
          message,
          senderModel: 'User',
        });

        await newMessage.save();

        const populated = await Message.findById(newMessage._id)
          .populate('senderId', 'name role type');

        io.to(complaintId).emit('receive_message', populated);
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
