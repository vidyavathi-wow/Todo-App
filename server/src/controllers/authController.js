const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');

exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
      { name, email, password: hashedPassword },
      { transaction: t }
    );

    await t.commit();

    try {
      await sendEmail(
        email,
        'Welcome to Your To-Do App!',
        `Hi ${name},\n\nWelcome to your To-Do App! 🎉\nYou can now create, edit, and manage your daily tasks easily.\n\nThanks for joining us!\n\n– The To-Do App Team`
      );
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, transaction: t });

    if (!user) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    user.refreshToken = refreshToken;
    await user.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token required' });

    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecret'
    );
    const user = await User.findByPk(payload.userId);

    if (!user || user.refreshToken !== token) {
      return res
        .status(403)
        .json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({ success: true, accessToken });
  } catch {
    res
      .status(403)
      .json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: 'Refresh token required' });

    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecret'
    );
    const user = await User.findByPk(payload.userId);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

      try {
        await sendEmail(email, 'Reset Password', `Reset link: ${link}`);
      } catch (err) {
        console.error('Email error:', err.message);
      }
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
    const { token } = req.query; // ← Change this line
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
