const nodemailer = require('nodemailer');

const getBackendBaseUrl = () => {
  if (process.env.BACKEND_BASE_URL) return process.env.BACKEND_BASE_URL;
  const port = process.env.PORT || process.env.AUTH_PORT || 3000;
  return `http://localhost:${port}`;
};

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendMail = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('Email transporter is not configured. Skipping email send.');
    return false;
  }

  await transporter.sendMail({
    from: `"PharmaGuard" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
  return true;
};

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${getBackendBaseUrl()}/api/v1/users/verify-email/${token}`;
    return await sendMail({
      to: email,
      subject: 'Verify your PharmaGuard account',
      text: `Welcome to PharmaGuard.\n\nPlease verify your email:\n${verificationUrl}\n\nThis link expires in 10 minutes.`,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

const sendResetPasswordOtpEmail = async (email, otp) => {
  try {
    return await sendMail({
      to: email,
      subject: 'Reset your PharmaGuard password',
      text: `Your PharmaGuard password reset OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,
    });
  } catch (error) {
    console.error('Error sending reset password OTP email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordOtpEmail,
  isEmailConfigured,
};
