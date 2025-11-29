const User = require('../models/User');
const Todo = require('../models/Todo');
const ActivityLog = require('../models/ActivityLog');
const { Op } = require('sequelize');

module.exports = {
  // ---------------------------------------------------------
  // PAGINATED USER LIST (Admin = full info, User = name only)
  // ---------------------------------------------------------
  listUsers: async (reqUser, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const isAdmin = reqUser.role === 'admin';

    const { count, rows } = await User.findAndCountAll({
      attributes: isAdmin
        ? ['id', 'name', 'email'] // Admin sees email
        : ['id', 'name'], // Non-admin sees only name
      limit,
      offset,
      order: [['name', 'ASC']],
      paranoid: true, // Only active (non-deleted) users
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalUsers: count,
      users: rows,
    };
  },

  // ---------------------------------------------------------
  // FETCH DASHBOARD DETAILS FOR SPECIFIC USER
  // ---------------------------------------------------------
  getUserDashboardDetails: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false,
    });

    if (!user) throw new Error('User not found');

    const todosCount = await Todo.count({
      where: { userId },
      paranoid: false,
    });

    const logs = await ActivityLog.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: 10,
    });

    return {
      user,
      stats: {
        todosCount,
        deleted: !!user.deletedAt,
        isActive: !user.deletedAt,
      },
      logs,
    };
  },
};
