const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const ActivityLog = require('../models/ActivityLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const existingUser = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (existingUser && existingUser.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact admin.',
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    sendEmail(
      email,
      'Welcome to Your To-Do App!',
      `Hi ${name},\n\nWelcome to your To-Do App! 🎉`
    ).catch(() => {});

    ActivityLog.create({
      userId: user.id,
      action: 'User Registered',
      details: `New account created for ${user.email}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a registered email.',
      });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password.',
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    ActivityLog.create({
      userId: user.id,
      action: 'User Logged In',
      details: `${user.email} logged in.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      ActivityLog.create({
        userId: req.user.id,
        action: 'User Logged Out',
        details: 'User logged out.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email.',
      });
    }

    const user = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Enter your registered email address.',
      });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact admin.',
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    sendEmail(email, 'Reset Password', `Reset link: ${link}`).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'If registered, reset link sent.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token missing.',
      });
    }

    if (!password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be empty.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err.name === 'TokenExpiredError'
            ? 'Reset link expired.'
            : 'Invalid reset link.',
      });
    }

    const user = await User.findByPk(decoded.userId, {
      paranoid: false,
    });

    if (!user || user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
