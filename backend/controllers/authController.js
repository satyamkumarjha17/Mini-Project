const User = require('../models/User');
const RegistrationOTP = require('../models/RegistrationOTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(
    { id: user._id, type: user.type, role: user.role, department: user.department },
    secret,
    { expiresIn: '1d' }
  );
};

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  type: user.type,
  role: user.role,
  studentType: user.studentType,
  department: user.department,
});

// Validate email format based on account type
const validateEmail = (email, type) => {
  if (type === 'Student') return /^[A-Za-z0-9._%+-]+@cuchd\.in$/.test(email);
  if (type === 'Management') return /^[A-Za-z0-9._%+-]+@cumail\.in$/.test(email);
  return false;
};

// POST /api/auth/send-registration-otp
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email, uid, type } = req.body;

    if (!validateEmail(email, type)) {
      return res.status(400).json({
        message: type === 'Student'
          ? 'Students must use a @cuchd.in email address'
          : 'Management must use a @cumail.in email address'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Email or UID already exists' });
    }

    const otp = generateOTP();
    await RegistrationOTP.deleteOne({ email });
    await new RegistrationOTP({ email, otp }).save();

    await sendEmail({
      email,
      subject: 'Verify Your Registration Email - CU Portal',
      message: `Your registration verification code is: <strong>${otp}</strong>. It is valid for 10 minutes. Do not share it with anyone.`,
    });

    res.json({ message: 'Registration OTP sent successfully' });
  } catch (error) {
    console.error('sendRegistrationOtp error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name, uid, email, password, role, type, gender,
      studentType, hostelName, roomNumber, department, otp
    } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    if (!validateEmail(email, type)) {
      return res.status(400).json({ message: 'Invalid email format for the selected account type' });
    }

    const registrationOtp = await RegistrationOTP.findOne({ email });
    if (!registrationOtp) return res.status(400).json({ message: 'OTP expired or not requested. Please request a new one.' });
    if (registrationOtp.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, uid, email,
      password: hashedPassword,
      role: role || (type === 'Student' ? studentType : 'management'),
      type,
      gender,
      studentType,
      hostelName,
      roomNumber,
      department,
      isVerified: true,
    });

    await newUser.save();
    await RegistrationOTP.deleteOne({ email });

    res.status(201).json({ message: 'Account registered successfully. You can now log in.' });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - CU Portal',
      message: `Your OTP for resetting your password is: <strong>${otp}</strong>. It is valid for 10 minutes.`,
    });

    res.json({ message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'OTP has expired' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login-otp-request
exports.loginWithOtpRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Login OTP - CU Portal',
      message: `Your OTP for logging in is: <strong>${otp}</strong>. It is valid for 10 minutes.`,
    });

    res.json({ message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error('loginWithOtpRequest error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login-otp-verify
exports.loginWithOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'OTP has expired' });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (error) {
    console.error('loginWithOtpVerify error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
