const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id',
        'name',
        'email',
        'profilePic',
        'role',
        'createdAt',
        'deletedAt',
      ],
      paranoid: false,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Details does not match' });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const profileWithDefault = {
      ...user.toJSON(),
      profilePic: user.profilePic || null,
    };

    return res.status(200).json({ success: true, user: profileWithDefault });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id, { paranoid: false });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated and cannot be updated.',
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      user.email = email.trim();
    }

    if (req.file && req.file.path) {
      user.profilePic = req.file.path;
    }

    await user.save();

    await ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      details: `User ${user.email} updated their profile.`,
    });

    const response = {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
