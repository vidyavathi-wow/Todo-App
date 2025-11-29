const sequelize = require('../config/db');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Todo = require('../models/Todo');
const sendEmail = require('../config/emailServeice');
const logger = require('../utils/logger');

module.exports = {
  // -------------------------------------------------------
  // GET ALL USERS (Paginated)
  // -------------------------------------------------------
  getAllUsers: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalUsers: count,
      users,
    };
  },

  // -------------------------------------------------------
  // USER DASHBOARD DETAILS
  // -------------------------------------------------------
  getUserDashboardDetails: async (id) => {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false,
    });

    if (!user) return null;

    const todosCount = await Todo.count({
      where: { userId: id },
      paranoid: false,
    });

    const logs = await ActivityLog.findAll({
      where: { userId: id },
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

  // -------------------------------------------------------
  // ACTIVITY LOGS (Paginated)
  // -------------------------------------------------------
  getActivityLogs: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'],
          paranoid: false,
        },
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalLogs: count,
      logs,
    };
  },

  // -------------------------------------------------------
  // DELETE USER BY ADMIN
  // -------------------------------------------------------
  deleteUserByAdmin: async (admin, userId) => {
    return await sequelize.transaction(async (t) => {
      if (admin.id == userId) {
        throw new Error('You cannot deactivate your own admin account.');
      }

      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new Error('User not found');

      if (user.role === 'admin') {
        throw new Error('Admins cannot deactivate other admins.');
      }

      const todoCount = await Todo.count({ where: { userId }, transaction: t });
      if (todoCount > 0) {
        throw new Error(
          'User has assigned tasks. Reassign or delete tasks first.'
        );
      }

      await user.destroy({ transaction: t });

      await ActivityLog.create(
        {
          userId: admin.id,
          action: 'DEACTIVATE_USER',
          details: `Admin ${admin.email} deactivated user ${user.email}.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      return `User '${user.email}' deactivated successfully.`;
    });
  },

  // -------------------------------------------------------
  // RESTORE USER
  // -------------------------------------------------------
  restoreUserByAdmin: async (admin, userId) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, {
        paranoid: false,
        transaction: t,
      });

      if (!user || !user.deletedAt)
        throw new Error('No deactivated user found');

      await user.restore({ transaction: t });
      await Todo.restore({ where: { userId }, transaction: t });
      await ActivityLog.restore({ where: { userId }, transaction: t });

      await ActivityLog.create(
        {
          userId: admin.id,
          action: 'RESTORE_USER',
          details: `Admin ${admin.email} restored user ${user.email}.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      return `User '${user.email}' restored successfully.`;
    });
  },

  // -------------------------------------------------------
  // PROMOTE USER
  // -------------------------------------------------------
  promoteUserByAdmin: async (admin, userId) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new Error('User not found');

      if (user.role === 'admin') throw new Error('User is already an admin');

      await user.update({ role: 'admin' }, { transaction: t });

      await ActivityLog.create(
        {
          userId: admin.id,
          action: 'PROMOTE_USER',
          details: `Admin ${admin.email} promoted ${user.email}.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      // send email
      try {
        await sendEmail(
          user.email,
          '🎉 You’ve been promoted to Admin',
          `Hello ${user.name || user.email},

You have been promoted to Admin by ${admin.email}.`
        );
      } catch (err) {
        logger.error('Promotion email failed:', err);
      }

      return `User '${user.email}' promoted to admin.`;
    });
  },

  // -------------------------------------------------------
  // DEMOTE USER
  // -------------------------------------------------------
  demoteUserByAdmin: async (admin, userId) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new Error('User not found');

      if (user.role !== 'admin') throw new Error('User is already normal user');

      await user.update({ role: 'user' }, { transaction: t });

      await ActivityLog.create(
        {
          userId: admin.id,
          action: 'DEMOTE_USER',
          details: `Admin ${admin.email} demoted ${user.email}.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      try {
        await sendEmail(
          user.email,
          '⚠️ Your Admin Privileges have been removed',
          `Hello ${user.name}, ${admin.email} removed your admin role.`
        );
      } catch (err) {
        logger.error('Demotion email failed:', err);
      }

      return `Admin '${user.email}' demoted to user.`;
    });
  },
};
