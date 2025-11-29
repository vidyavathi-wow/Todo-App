const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user?.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(error.message === 'Unauthorized' ? 401 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await profileService.updateProfile(
      req.user?.id,
      req.body,
      req.file
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(error.message.includes('deactivated') ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};
