const nodemailer = require('nodemailer');

let transporter;

if (process.env.NODE_ENV === 'development') {
  const nodemailerMock = require('nodemailer-mock');
  transporter = nodemailerMock.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
  });
  console.log('Using mock email transporter for development');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

transporter.verify(function (error, success) {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

exports.sendVerificationEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: `"E-commerce Site" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering. Please verify your email by clicking on the following link:</p>
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

exports.sendPasswordResetEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: `"E-commerce Site" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click on the following link to reset your password:</p>
        <a href="${process.env.BASE_URL}/reset-password/${token}">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

exports.sendOrderConfirmationEmail = async (email, orderDetails) => {
  try {
    const mailOptions = {
      from: `"E-commerce Site" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order. Here are your order details:</p>
        <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};