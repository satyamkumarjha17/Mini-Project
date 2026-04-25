import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, Clock, User, Building, MessageSquare, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL;

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`/complaints/${id}`);
        setComplaint(res.data);
      } catch (err) {
        console.error('Failed to load complaint:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();

    // Connect socket with JWT authentication
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_complaint', id);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socket.on('chat_history', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => socket.disconnect();
  }, [id, navigate, token]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !connected) return;

    socketRef.current.emit('send_message', {
      complaintId: id,
      message: newMessage.trim(),
      // senderId is NOT passed from client — server uses socket.user.id from JWT
    });

    setNewMessage('');
  };

  const updateStatus = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await axios.put(`/complaints/${id}/status`, { status: newStatus });
      setComplaint(res.data);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!complaint) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Complaint Info</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Title</h3>
                <p className="font-medium text-slate-900">{complaint.title}</p>
              </div>

              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Description</h3>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Department</h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    <Building className="h-4 w-4 text-slate-400" />
                    {complaint.department}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Category</h3>
                  <p className="text-sm font-medium text-slate-800">{complaint.category}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date Submitted</h3>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(complaint.createdAt).toLocaleString()}
                </div>
              </div>

              {complaint.deadline && (
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                    SLA Deadline
                    {complaint.isEscalated && (
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" /> ESCALATED
                      </span>
                    )}
                  </h3>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${complaint.isEscalated ? 'text-red-600' : 'text-slate-800'}`}>
                    <Clock className={`h-4 w-4 ${complaint.isEscalated ? 'text-red-500' : 'text-slate-400'}`} />
                    {new Date(complaint.deadline).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="pt-4 border-t">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Status</h3>
                {user.type === 'Management' ? (
                  <div className="flex gap-2">
                    {['Pending', 'In Progress', 'Resolved'].map((s) => (
                      <button
                        key={s}
                        disabled={statusLoading || complaint.status === s}
                        onClick={() => updateStatus(s)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                          complaint.status === s
                            ? s === 'Resolved' ? 'bg-green-100 border-green-300 text-green-800'
                            : s === 'In Progress' ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className={`px-3 py-1 text-sm font-bold rounded-full border inline-block ${
                    complaint.status === 'Resolved' ? 'bg-green-100 border-green-300 text-green-800'
                    : complaint.status === 'In Progress' ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  }`}>
                    {complaint.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Student Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{complaint.studentId?.name}</p>
                  <p className="text-sm text-slate-500">{complaint.studentId?.uid}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-xs">Type</span>
                  <span className="font-medium">{complaint.studentId?.studentType || '—'}</span>
                </div>
                {complaint.studentId?.studentType === 'Hosteler' && (
                  <>
                    <div>
                      <span className="text-slate-500 block text-xs">Hostel</span>
                      <span className="font-medium">{complaint.studentId?.hostelName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Room</span>
                      <span className="font-medium">{complaint.studentId?.roomNumber}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Chat */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Communication Thread</h2>
              <p className="text-xs text-slate-500">
                Real-time chat with {user.type === 'Student' ? 'Management' : 'Student'}
              </p>
            </div>
            <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full border ${
              connected
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-slate-400 bg-slate-50 border-slate-200'
            }`}>
              {connected
                ? <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected</>
                : <><WifiOff className="w-3 h-3" /> Connecting...</>
              }
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col text-slate-400">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId?._id === user.id;
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 flex flex-col ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-sm'
                    }`}>
                      {!isMe && (
                        <span className="text-xs font-medium mb-1 opacity-70">
                          {msg.senderId?.name}
                          {msg.senderId?.role ? ` (${msg.senderId.role})` : ''}
                        </span>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <span className={`text-[10px] mt-1 ${isMe ? 'text-primary-100 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={connected ? 'Type your message...' : 'Connecting...'}
                disabled={!connected}
                className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !connected}
                className="bg-primary-600 text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
