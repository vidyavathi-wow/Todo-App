const authService = require('../services/authService');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const result = await authService.register(name, email, password);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json({
      success: true,
      message: 'Account created successfully.',
      user: result.data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    // Set cookie exactly like original code
    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken: result.data.accessToken,
      user: result.data.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const result = await authService.refreshAccessToken(
      req.cookies.refreshToken
    );

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      accessToken: result.data.accessToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const result = await authService.logout(
      req.body.refreshToken,
      req.user?.id
    );

    return res.status(result.status).json({
      success: true,
      message: result.data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body.email);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: result.data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(
      req.query.token,
      req.body.password
    );

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: result.data,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
