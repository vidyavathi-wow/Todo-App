const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const ActivityLog = require('../models/ActivityLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (existingUser && existingUser.deletedAt) {
      await existingUser.restore();
      existingUser.name = name || existingUser.name;
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.role = role || 'user';
      await existingUser.save();

      await ActivityLog.create({
        userId: existingUser.id,
        action: 'USER_RESTORED',
        details: `User ${existingUser.email} restored via re-registration.`,
      });

      return res.status(200).json({
        success: true,
        message: 'Account restored and updated successfully',
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    try {
      await sendEmail(
        email,
        'Welcome to Your To-Do App!',
        `Hi ${name},\n\nWelcome to your To-Do App! 🎉`
      );
    } catch {}

    await ActivityLog.create({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      details: `User ${newUser.email} signed up.`,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
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
      action: 'USER_LOGGED_IN',
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      await ActivityLog.create({
        userId: req.user.id,
        action: 'USER_LOGGED_OUT',
        details: `User logged out.`,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered email',
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

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    try {
      await sendEmail(email, 'Reset Password', `Reset link: ${resetLink}`);
    } catch {}

    return res.status(200).json({
      success: true,
      message: 'If registered, reset link sent',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, { paranoid: false });

    if (!user || user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Password reset successful' });
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
