const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const sendEmail = require('../config/emailServeice');
const ActivityLog = require('../models/ActivityLog');
const { Op } = require('sequelize');
module.exports = {
  register: async (name, email, password) => {
    if (!name || !email || !password) {
      return { status: 400, error: 'All fields are required.' };
    }

    const existingUser = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        return {
          status: 403,
          error: 'Your account is deactivated. Contact admin.',
        };
      }
      return { status: 400, error: 'Email is already registered.' };
    }

    const existingName = await User.findOne({
      where: { name: { [Op.iLike]: name } },
      paranoid: false,
    });
    if (existingName) {
      return {
        status: 400,
        error: 'Name is already taken. Please choose another.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Optional welcome email
    sendEmail(
      email,
      'Welcome to Your To-Do App!',
      `Hi ${name},\n\nWelcome to your To-Do App! 🎉`
    ).catch(() => {});

    // Log activity
    ActivityLog.create({
      userId: user.id,
      action: 'User Registered',
      details: `New account created for ${user.email}`,
    });

    return {
      status: 201,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  login: async (email, password) => {
    if (!email || !password) {
      return { status: 400, error: 'Email and password are required.' };
    }

    const user = await User.findOne({ where: { email }, paranoid: false });

    if (!user) {
      return { status: 400, error: 'Please enter a registered email.' };
    }

    if (user.deletedAt) {
      return {
        status: 403,
        error: 'Your account is deactivated. Contact admin.',
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { status: 400, error: 'Incorrect password.' };
    }

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    ActivityLog.create({
      userId: user.id,
      action: 'User Logged In',
      details: `${user.email} logged in.`,
    });

    return {
      status: 200,
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        refreshToken,
      },
    };
  },

  refreshAccessToken: async (refreshToken) => {
    if (!refreshToken) {
      return { status: 400, error: 'Refresh token missing.' };
    }

    const stored = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!stored) {
      return { status: 403, error: 'Invalid refresh token.' };
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      await stored.destroy();
      return { status: 403, error: 'Refresh token expired. Login again.' };
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      await stored.destroy();
      return { status: 403, error: 'User not found.' };
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      status: 200,
      data: { accessToken: newAccessToken },
    };
  },

  logout: async (refreshToken, userId) => {
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }

    if (userId) {
      ActivityLog.create({
        userId,
        action: 'User Logged Out',
        details: 'User logged out.',
      });
    }

    return {
      status: 200,
      data: 'Logged out successfully.',
    };
  },

  forgotPassword: async (email) => {
    if (!email?.trim()) {
      return { status: 400, error: 'Please enter your email.' };
    }

    const user = await User.findOne({ where: { email }, paranoid: false });

    if (!user) {
      return { status: 400, error: 'Enter your registered email address.' };
    }

    if (user.deletedAt) {
      return {
        status: 403,
        error: 'Your account is deactivated. Contact admin.',
      };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    sendEmail(email, 'Reset Password', `Reset link: ${link}`).catch(() => {});

    return { status: 200, data: 'If registered, reset link sent.' };
  },

  resetPassword: async (token, password) => {
    if (!token) {
      return { status: 400, error: 'Reset token missing.' };
    }

    if (!password?.trim()) {
      return { status: 400, error: 'Password cannot be empty.' };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return { status: 400, error: 'Invalid or expired reset link.' };
    }

    const user = await User.findByPk(decoded.userId, { paranoid: false });

    if (!user || user.deletedAt) {
      return { status: 400, error: 'Invalid or expired reset link.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      status: 200,
      data: 'Password updated successfully.',
    };
  },
};
