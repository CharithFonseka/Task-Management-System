const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendWelcomeEmail = async (email, name, tempPassword) => {
  await transporter.sendMail({
    from: `"Task Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome - Your Account Details',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account has been created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `,
  });
};

module.exports = { sendWelcomeEmail };