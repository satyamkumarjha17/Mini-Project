const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  loginWithOtpRequest,
  loginWithOtpVerify,
  sendRegistrationOtp
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login-otp-request', loginWithOtpRequest);
router.post('/login-otp-verify', loginWithOtpVerify);
router.post('/send-registration-otp', sendRegistrationOtp);

module.exports = router;
