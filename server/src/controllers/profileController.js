const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
  try {
    const result = await profileService.getProfile(req.user?.id);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      user: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateProfile(
      req.user?.id,
      req.body,
      req.file
    );

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
