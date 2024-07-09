const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
      console.log('Email service error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
  
 // Function to send verification email
 exports.sendVerificationEmail = async (email, token) => {
    try {
      const mailOptions = {
        from: `"E-commerce Site" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Email',
        html: `
          <h1>Email Verification</h1>
          <p>Thank you for registering. Please verify email by clicking on the following link:</p>
          <a href="${process.env.BASE_URL}/api/users/verify/${token}">Verify Email</a>
          <p>If you did not request this, please ignore this email.</p>
        `
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  };
  
  