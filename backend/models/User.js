const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uid: { type: String, required: true, unique: true, sparse: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['Student', 'Management'], required: true },

  // Management Specific
  department: { type: String },
  designation: { type: String },

  // Student Specific
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  studentType: { type: String, enum: ['Hosteler', 'Day Scholar'] },
  hostelName: { type: String },
  roomNumber: { type: String },

  // OTP and Verification
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
