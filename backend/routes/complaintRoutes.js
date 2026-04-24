const express = require('express');
const router = express.Router();
const {
  getComplaints,
  createComplaint,
  getComplaintById,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getComplaints);
router.post('/', protect, createComplaint);
router.get('/:id', protect, getComplaintById);
router.put('/:id/status', protect, updateComplaintStatus);

module.exports = router;
