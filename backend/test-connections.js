require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function test() {
  console.log('Testing DB connection...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected successfully.');
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }

  console.log('Testing SMTP connection...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('SMTP verified successfully.');
  } catch (err) {
    console.error('SMTP verification failed:', err.message);
  }

  process.exit(0);
}

test();
