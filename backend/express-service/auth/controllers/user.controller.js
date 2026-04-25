const User = require('../models/user.models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const jwksClient = require('jwks-rsa');
const {
  sendResetPasswordOtpEmail,
} = require('../utils/sendingMail.utils');

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)[0] || 'http://localhost:5173';

const safeUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePic: user.profilePic,
  isVerified: user.isVerified,
  role: user.role,
  createdAt: user.createdAt,
  lastLogin: user.updatedAt,
});

const generateRandomToken = () => crypto.randomBytes(24).toString('hex');
const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const createJwtForUser = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  });

const setAuthCookie = (res, token) => {
  res.cookie('jwtToken', token, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ status: false, message: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ status: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    return res.status(201).json({
      status: true,
      message: 'User registered successfully.',
      user: safeUserPayload(user),
    });
  } catch (error) {
    console.error('User registration failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'All fields are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ status: false, message: 'Account not found. Please sign up first.' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }

    const jwtToken = createJwtForUser(user);
    setAuthCookie(res, jwtToken);

    return res.status(200).json({
      status: true,
      message: 'User logged in successfully',
      token: jwtToken,
      user: safeUserPayload(user),
    });
  } catch (error) {
    console.error('User login failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).send('Invalid verification token');
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(`${getFrontendUrl()}/login?error=verification_failed`);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return res.redirect(`${getFrontendUrl()}/login?verified=1`);
  } catch (error) {
    console.error('Email verification failed', error);
    return res.redirect(`${getFrontendUrl()}/login?error=verification_failed`);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    return res.status(200).json({ status: true, message: 'Email verification is not required.' });
  } catch (error) {
    console.error('Resend verification failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        status: true,
        message: 'If an account exists for this email, an OTP has been sent.',
      });
    }

    const otp = generateOtp();
    user.resetPasswordToken = hashOtp(otp);
    user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.resetPasswordVerifiedToken = null;
    user.resetPasswordVerifiedTokenExpiry = null;
    await user.save();
    const emailSent = await sendResetPasswordOtpEmail(user.email, otp);

    const response = {
      status: true,
      message: 'If an account exists for this email, an OTP has been sent.',
    };

    // Local/dev fallback when SMTP is not configured.
    if (!emailSent && process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Forgot password failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ status: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashOtp(String(otp).trim()),
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
    }

    const verifiedToken = generateRandomToken();
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    user.resetPasswordVerifiedToken = verifiedToken;
    user.resetPasswordVerifiedTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.status(200).json({
      status: true,
      message: 'OTP verified successfully',
      resetToken: verifiedToken,
    });
  } catch (error) {
    console.error('Verify reset OTP failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ status: false, message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordVerifiedToken: token,
      resetPasswordVerifiedTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    user.resetPasswordVerifiedToken = null;
    user.resetPasswordVerifiedTokenExpiry = null;
    await user.save();

    return res.status(200).json({ status: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password failed', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found' });
    }
    return res.status(200).json({ status: true, user: safeUserPayload(user) });
  } catch (error) {
    console.error('Error getting user profile', error);
    return res.status(500).json({ status: false, message: 'Error getting user profile' });
  }
};

const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    res.cookie('jwtToken', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
      path: '/',
    });
    return res.status(200).json({ status: true, message: 'User logged out successfully' });
  } catch (error) {
    console.error('User logout failed', error);
    return res.status(500).json({ status: false, message: 'User logout failed' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const { name, phone, profilePic, password } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ status: false, message: 'Password must be at least 6 characters long' });
      }
      user.password = password;
    }

    await user.save();
    return res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      user: safeUserPayload(user),
    });
  } catch (error) {
    console.error('Profile update failed', error);
    return res.status(500).json({ status: false, message: error.message || 'Profile update failed' });
  }
};

// ─── Google OAuth (OpenID Connect) ───────────────────────────────────────────

const generateState = () => crypto.randomBytes(32).toString('hex');
const generateNonce = () => crypto.randomBytes(32).toString('hex');

const getJwksClient = () => {
  return jwksClient({
    jwksUri: process.env.GOOGLE_JWKS_URL || 'https://www.googleapis.com/oauth2/v3/certs',
    cache: true,
    rateLimit: true,
  });
};

const getSigningKey = async (kid) => {
  const client = getJwksClient();
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
};

const verifyGoogleToken = async (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) throw new Error('Invalid token');
  const signingKey = await getSigningKey(decoded.header.kid);
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    audience: process.env.GOOGLE_CLIENT_ID,
  });
};

const googleLogin = (req, res) => {
  const state = generateState();
  const nonce = generateNonce();

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    httpOnly: true,
    maxAge: 600000,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  };
  res.cookie('oauth_state', state, cookieOpts);
  res.cookie('oauth_nonce', nonce, cookieOpts);

  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=email%20profile%20openid` +
    `&state=${state}` +
    `&nonce=${nonce}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(googleAuthUrl);
};

const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;
    const savedNonce = req.cookies.oauth_nonce;

    res.clearCookie('oauth_state');
    res.clearCookie('oauth_nonce');

    if (!state || !savedState || state !== savedState) {
      return res.status(401).json({ status: false, message: 'Invalid state parameter' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        code,
        grant_type: 'authorization_code',
      },
    });

    const { id_token, refresh_token } = tokenResponse.data;
    if (!id_token) {
      return res.status(401).json({ status: false, message: 'No ID token received' });
    }

    const decodedToken = await verifyGoogleToken(id_token);
    if (!decodedToken) {
      return res.status(401).json({ status: false, message: 'Invalid ID token' });
    }
    if (!decodedToken.nonce || decodedToken.nonce !== savedNonce) {
      return res.status(401).json({ status: false, message: 'Invalid nonce' });
    }

    let user = await User.findOne({ googleId: decodedToken.sub });
    if (!user) {
      user = await User.findOne({ email: decodedToken.email });
      if (user) {
        user.googleId = decodedToken.sub;
        user.isVerified = true;
        if (!user.profilePic && decodedToken.picture) user.profilePic = decodedToken.picture;
        if (refresh_token) user.refreshToken = refresh_token;
        await user.save();
      } else {
        user = await User.create({
          googleId: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split('@')[0],
          profilePic: decodedToken.picture || '',
          refreshToken: refresh_token || null,
          isVerified: true,
        });
      }
    } else if (refresh_token) {
      user.refreshToken = refresh_token;
      await user.save();
    }

    const jwtToken = createJwtForUser(user);
    setAuthCookie(res, jwtToken);

    return res.redirect(
      `${getFrontendUrl()}/auth/google/callback?token=${jwtToken}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&id=${user._id}`
    );
  } catch (error) {
    console.error('Google OAuth Callback Error:', error.response?.data || error.message);
    return res.redirect(`${getFrontendUrl()}/login?error=google_auth_failed`);
  }
};

module.exports = {
  registerUser,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  logout,
  updateProfile,
  googleLogin,
  googleCallback,
};
