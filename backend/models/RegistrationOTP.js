const mongoose = require('mongoose');

const registrationOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 600, default: Date.now }
});

module.exports = mongoose.model('RegistrationOTP', registrationOTPSchema);
