const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

module.exports = {
  // ---------------------------------------------------------
  // GET PROFILE
  // ---------------------------------------------------------
  getProfile: async (userId) => {
    if (!userId) throw new Error('Unauthorized');

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
      throw new Error('Details does not match');
    }

    if (user.deletedAt) {
      throw new Error(
        'Your account has been deactivated. Please contact support.'
      );
    }

    return {
      ...user.toJSON(),
      profilePic: user.profilePic || null,
    };
  },

  // ---------------------------------------------------------
  // UPDATE PROFILE
  // ---------------------------------------------------------
  updateProfile: async (userId, updates, file) => {
    if (!userId) throw new Error('Unauthorized');

    const user = await User.findByPk(userId, { paranoid: false });

    if (!user) throw new Error('User not found');
    if (user.deletedAt)
      throw new Error('Your account is deactivated and cannot be updated.');

    // Update fields
    if (updates.name?.trim()) user.name = updates.name.trim();
    if (updates.email?.trim()) user.email = updates.email.trim();
    if (file?.path) user.profilePic = file.path;

    await user.save();

    await ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      details: `User ${user.email} updated their profile.`,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    };
  },
};
