const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ActivityLog = require('../models/ActivityLog');
const sendEmail = require('../config/emailServeice');

module.exports = {
  // ---------------------------------------------------------
  // REGISTER USER
  // ---------------------------------------------------------
  register: async ({ name, email, password }) => {
    const existingUser = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (existingUser && existingUser.deletedAt) {
      throw new Error('Your account is deactivated. Contact admin.');
    }

    if (existingUser) {
      throw new Error('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Send welcome email
    sendEmail(
      email,
      'Welcome to Your To-Do App!',
      `Hi ${name}, welcome!`
    ).catch(() => {});

    // Activity log
    await ActivityLog.create({
      userId: user.id,
      action: 'User Registered',
      details: `New account created for ${user.email}`,
    });

    return user;
  },

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  login: async (email, password) => {
    const user = await User.findOne({ where: { email }, paranoid: false });

    if (!user) throw new Error('Please enter a registered email.');
    if (user.deletedAt)
      throw new Error('Your account is deactivated. Contact admin.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Incorrect password.');

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });

    await ActivityLog.create({
      userId: user.id,
      action: 'User Logged In',
      details: `${user.email} logged in.`,
    });

    return { user, accessToken, refreshToken };
  },

  // ---------------------------------------------------------
  // REFRESH ACCESS TOKEN
  // ---------------------------------------------------------
  refreshToken: async (incomingToken) => {
    const stored = await RefreshToken.findOne({
      where: { token: incomingToken },
    });
    if (!stored) throw new Error('Invalid refresh token.');

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      await stored.destroy();
      throw new Error('Refresh token expired. Login again.');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      await stored.destroy();
      throw new Error('User not found.');
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return newAccessToken;
  },

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  logout: async (refreshToken, userId) => {
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }

    if (userId) {
      await ActivityLog.create({
        userId,
        action: 'User Logged Out',
        details: 'User logged out.',
      });
    }
  },

  // ---------------------------------------------------------
  // FORGOT PASSWORD
  // ---------------------------------------------------------
  forgotPassword: async (email) => {
    const user = await User.findOne({ where: { email }, paranoid: false });

    if (!user) throw new Error('Enter your registered email address.');
    if (user.deletedAt)
      throw new Error('Your account is deactivated. Contact admin.');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    sendEmail(email, 'Reset Password', `Reset link: ${link}`).catch(() => {});

    return true;
  },

  // ---------------------------------------------------------
  // RESET PASSWORD
  // ---------------------------------------------------------
  resetPassword: async (token, newPassword) => {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired reset link.');
    }

    const user = await User.findByPk(decoded.userId, { paranoid: false });
    if (!user || user.deletedAt)
      throw new Error('Invalid or expired reset link.');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return true;
  },
};
