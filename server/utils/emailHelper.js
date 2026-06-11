const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// Send welcome email with temporary password
const sendWelcomeEmail = async (toEmail, name, tempPassword) => {
  try {
    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Welcome to Task Management System — Your Login Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Task Management System</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created. Here are your login details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${toEmail}</p>
            <p><strong>Temporary Password:</strong> 
              <span style="color: #dc2626; font-size: 18px;">
                ${tempPassword}
              </span>
            </p>
          </div>

          <p style="color: #dc2626;">
            ⚠️ You must change your password on first login.
          </p>

          <p>Login here: 
            <a href="http://localhost:3000/login">
              http://localhost:3000/login
            </a>
          </p>

          <hr/>
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${toEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};

// Send password reset notification
const sendPasswordResetEmail = async (toEmail, name) => {
  try {
    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Changed</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your password has been changed successfully.</p>
          <p>If you did not make this change, 
             please contact your administrator immediately.
          </p>
          <hr/>
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${toEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};