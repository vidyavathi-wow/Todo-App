const sequelize = require('../config/db');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const sendEmail = require('../config/emailServeice');

module.exports = {
  getAllUsers: async ({ page, limit }) => {
    const offset = (page - 1) * limit;

    const data = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return data;
  },

  getUserDashboardDetails: async ({ id }) => {
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

    return { user, todosCount, logs };
  },

  getActivityLogs: async ({ page, limit }) => {
    const offset = (page - 1) * limit;

    return await ActivityLog.findAndCountAll({
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
  },

  deleteUserByAdmin: async ({ admin, id }) => {
    return await sequelize.transaction(async (t) => {
      if (admin.id == id) {
        return {
          error: true,
          status: 403,
          message: 'You cannot deactivate your own admin account.',
        };
      }

      const user = await User.findByPk(id, { transaction: t });

      if (!user) {
        return { error: true, status: 404, message: 'User not found' };
      }

      if (user.role === 'admin') {
        return {
          error: true,
          status: 403,
          message: 'Admins cannot deactivate other admins.',
        };
      }

      const todoCount = await Todo.count({
        where: { userId: id },
        transaction: t,
      });

      if (todoCount > 0) {
        return {
          error: true,
          status: 400,
          message:
            'User has assigned tasks. Reassign or delete tasks before deactivation.',
        };
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

      return {
        error: false,
        message: `User '${user.email}' deactivated successfully.`,
      };
    });
  },

  restoreUserByAdmin: async ({ admin, id }) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(id, {
        paranoid: false,
        transaction: t,
      });

      if (!user || !user.deletedAt) {
        return {
          error: true,
          status: 404,
          message: 'No deactivated user found',
        };
      }

      await user.restore({ transaction: t });
      await Todo.restore({ where: { userId: id }, transaction: t });
      await ActivityLog.restore({ where: { userId: id }, transaction: t });

      await ActivityLog.create(
        {
          userId: admin?.id || null,
          action: 'RESTORE_USER',
          details: `Admin ${admin?.email || 'Unknown'} restored user ${user.email}.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      return {
        error: false,
        message: `User '${user.email}' restored successfully.`,
      };
    });
  },

  promoteUserByAdmin: async ({ admin, id }) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) return { error: true, status: 404, message: 'User not found' };

      if (user.role === 'admin')
        return {
          error: true,
          status: 400,
          message: 'User is already an admin',
        };

      await user.update({ role: 'admin' }, { transaction: t });

      await ActivityLog.create(
        {
          userId: admin?.id,
          action: 'PROMOTE_USER',
          details: `Admin ${admin.email} promoted ${user.email} to admin.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      try {
        await sendEmail(
          user.email,
          '🎉 You’ve been promoted to Admin',
          `Hello ${user.name || user.email},

Good news! You have been *promoted to Admin*.

Promoted by: ${admin.email}

Regards,
To-Do App Team`
        );
      } catch (emailErr) {
        logger.error('Promotion email failed:', emailErr);
      }

      return {
        error: false,
        message: `User '${user.email}' promoted to admin`,
      };
    });
  },

  demoteUserByAdmin: async ({ admin, id }) => {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) return { error: true, status: 404, message: 'User not found' };

      if (user.role !== 'admin')
        return {
          error: true,
          status: 400,
          message: 'User is already a normal user',
        };

      await user.update({ role: 'user' }, { transaction: t });

      await ActivityLog.create(
        {
          userId: admin?.id,
          action: 'DEMOTE_USER',
          details: `Admin ${admin.email} demoted ${user.email} from admin.`,
          timestamp: new Date(),
        },
        { transaction: t }
      );

      try {
        await sendEmail(
          user.email,
          '⚠️ Your Admin Privileges Have Been Updated',
          `Hello ${user.name || user.email},

Your admin privileges have been revoked by the administrator:

Changed by: ${admin.email}

Regards,
To-Do App Team`
        );
      } catch (emailErr) {
        logger.error('Demotion email failed:', emailErr);
      }

      return {
        error: false,
        message: `Admin '${user.email}' demoted to user`,
      };
    });
  },
};
