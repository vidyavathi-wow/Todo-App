const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

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
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body.email,
      req.body.password
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
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
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const newToken = await authService.refreshToken(req.cookies.refreshToken);

    return res.json({ success: true, accessToken: newToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logout(req.body.refreshToken, req.user?.id);

    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);

    return res.json({
      success: true,
      message: 'If registered, reset link sent.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.query.token, req.body.password);

    return res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
