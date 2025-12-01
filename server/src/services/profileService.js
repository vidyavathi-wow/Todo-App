const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

module.exports = {
  getProfile: async (userId) => {
    if (!userId) {
      return { status: 401, error: 'Unauthorized' };
    }

    const user = await User.findByPk(userId, {
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
      return { status: 404, error: 'Details does not match' };
    }

    if (user.deletedAt) {
      return {
        status: 403,
        error: 'Your account has been deactivated. Please contact support.',
      };
    }

    const profile = {
      ...user.toJSON(),
      profilePic: user.profilePic || null,
    };

    return { status: 200, data: profile };
  },

  updateProfile: async (userId, body, file) => {
    if (!userId) {
      return { status: 401, error: 'Unauthorized' };
    }

    const user = await User.findByPk(userId, { paranoid: false });

    if (!user) {
      return { status: 404, error: 'User not found' };
    }

    if (user.deletedAt) {
      return {
        status: 403,
        error: 'Your account is deactivated and cannot be updated.',
      };
    }

    if (body.name && body.name.trim()) {
      user.name = body.name.trim();
    }

    if (body.email && body.email.trim()) {
      user.email = body.email.trim();
    }

    if (file && file.path) {
      user.profilePic = file.path;
    }

    await user.save();

    await ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      details: `User ${user.email} updated their profile.`,
    });

    return {
      status: 200,
      data: {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          role: user.role,
        },
      },
    };
  },
};
