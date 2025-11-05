const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const ActivityLog = require('../models/ActivityLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    try {
      await sendEmail(
        email,
        'Welcome to Your To-Do App!',
        `Hi ${name},\n\nWelcome to your To-Do App! 🎉\nYou can now create, edit, and manage your daily tasks easily.\n\nThanks for joining us!\n\n– The To-Do App Team`
      );
    } catch (error) {
      console.error('Email error:', error.message);
    }

    await ActivityLog.create({
      userId: user.id,
      action: 'User Registered',
      details: `User ${user.email} signed up.`,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await ActivityLog.create({
      userId: user.id,
      action: 'User Logged In',
      details: `User ${user.email} logged in.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await ActivityLog.create({
        userId,
        action: 'User Logged Out',
        details: `User logged out.`,
      });
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered email',
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    try {
      await sendEmail(email, 'Reset Password', `Reset link: ${link}`);
    } catch (err) {
      console.error('Email error:', err.message);
    }

    res
      .status(200)
      .json({ success: true, message: 'If registered, reset link sent' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Password reset successful' });
  } catch {
    res
      .status(400)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
