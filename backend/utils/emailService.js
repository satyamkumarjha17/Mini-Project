const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in your .env file');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"CU Student Support Portal" <${smtpUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">CU Student Support Portal</h2>
        <p style="font-size: 15px; color: #334155;">${options.message}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✉️  Email sent to: ${options.email} | Subject: ${options.subject}`);
};
