const Complaint = require('../models/Complaint');

const getSLAHours = (department) => {
  const urgentDepts = ['Medical', 'Security', 'Food', 'Maintenance', 'IT Support'];
  const extendedDepts = ['Academics', 'Fee Department', 'DSW', 'DCPD', 'E-Governance', 'HOD', 'Faculty'];
  if (urgentDepts.includes(department)) return 12;
  if (extendedDepts.includes(department)) return 36;
  return 24;
};

// Lazy escalation helper
const runEscalation = async (filter = {}) => {
  await Complaint.updateMany(
    { ...filter, status: { $ne: 'Resolved' }, deadline: { $lt: new Date() }, isEscalated: false },
    { $set: { isEscalated: true } }
  );
};

// GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    let query = {};

    if (req.user.type === 'Student') {
      query.studentId = req.user.id;
      await runEscalation({ studentId: req.user.id });
    } else if (req.user.role === 'higher_authority') {
      // Higher authority sees ALL escalated complaints in their department
      query = { department: req.user.department, isEscalated: true };
      await runEscalation({ department: req.user.department });
    } else {
      // Regular management sees their department complaints
      query.department = req.user.department;
      await runEscalation({ department: req.user.department });
    }

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name uid email studentType hostelName roomNumber')
      .sort('-createdAt');

    res.json(complaints);
  } catch (error) {
    console.error('getComplaints error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    if (req.user.type !== 'Student') {
      return res.status(403).json({ message: 'Only students can file complaints' });
    }

    const { title, description, category, department } = req.body;
    if (!title || !description || !category || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const slaHours = getSLAHours(department);
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newComplaint = new Complaint({
      title,
      description,
      category,
      department,
      deadline,
      studentId: req.user.id,
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error('createComplaint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/complaints/:id
exports.getComplaintById = async (req, res) => {
  try {
    await runEscalation({ _id: req.params.id });

    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name uid email studentType hostelName roomNumber');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.type === 'Student' && complaint.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.type === 'Management') {
      const isCorrectDept = complaint.department === req.user.department;
      const isHigherAuthority = req.user.role === 'higher_authority';
      if (!isCorrectDept && !isHigherAuthority) {
        return res.status(403).json({ message: 'Not authorized for this department' });
      }
    }

    res.json(complaint);
  } catch (error) {
    console.error('getComplaintById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.type !== 'Management') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.department !== req.user.department && req.user.role !== 'higher_authority') {
      return res.status(403).json({ message: 'Not authorized for this department' });
    }

    complaint.status = status;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error('updateComplaintStatus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
