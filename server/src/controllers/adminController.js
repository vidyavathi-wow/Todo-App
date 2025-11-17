const sequelize = require('../config/db');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const sendEmail = require('../config/emailServeice');

exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, includeDeleted } = req.query;
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false, // <--- always show both active & inactive
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalUsers: count,
      users,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserDashboardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'deletedAt'],
      paranoid: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count user todos
    const todosCount = await Todo.count({
      where: { userId: id },
      paranoid: false,
    });

    // Get recent activity logs
    const logs = await ActivityLog.findAll({
      where: { userId: id },
      order: [['timestamp', 'DESC']],
      limit: 10,
    });

    return res.status(200).json({
      success: true,
      user,
      stats: {
        todosCount,
        deleted: !!user.deletedAt,
        isActive: !user.deletedAt,
      },
      logs,
    });
  } catch (err) {
    console.error('getUserDashboardDetails error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error fetching user details' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;
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

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalLogs: count,
      logs,
    });
  } catch (error) {
    console.error('getActivityLogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (req.user.id == id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot deactivate your own admin account.',
      });
    }

    const user = await User.findByPk(id, { transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Cannot deactivate another admin
    if (user.role === 'admin') {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: 'Admins cannot deactivate other admins.',
      });
    }

    // Check for todos
    const todoCount = await Todo.count({
      where: { userId: id },
      transaction: t,
    });

    if (todoCount > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          'User has assigned tasks. Reassign or delete tasks before deactivation.',
      });
    }

    // Soft delete user
    await user.destroy({ transaction: t });

    await ActivityLog.create(
      {
        userId: req.user.id,
        action: 'DEACTIVATE_USER',
        details: `Admin ${req.user.email} deactivated user ${user.email}.`,
        timestamp: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: `User '${user.email}' deactivated successfully.`,
    });
  } catch (err) {
    await t.rollback();
    console.error('deleteUserByAdmin error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreUserByAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { paranoid: false, transaction: t });

    if (!user || !user.deletedAt) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'No deactivated user found' });
    }

    await user.restore({ transaction: t });

    await Todo.restore({ where: { userId: id }, transaction: t });
    await ActivityLog.restore({ where: { userId: id }, transaction: t });

    await ActivityLog.create(
      {
        userId: req.user?.id || null,
        action: 'RESTORE_USER',
        details: `Admin ${req.user?.email || 'Unknown'} restored user ${user.email}.`,
        timestamp: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: `User '${user.email}' restored successfully.`,
    });
  } catch (error) {
    await t.rollback();
    console.error('restoreUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.promoteUserByAdmin = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { transaction: t });

    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: 'User is already an admin' });
    }

    await user.update({ role: 'admin' }, { transaction: t });

    await ActivityLog.create(
      {
        userId: req.user?.id,
        action: 'PROMOTE_USER',
        details: `Admin ${req.user.email} promoted ${user.email} to admin.`,
        timestamp: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    // 🎉 Send promotion email (NO rollback if email fails)
    try {
      await sendEmail(
        user.email,
        '🎉 You’ve been promoted to Admin',
        `Hello ${user.name || user.email},

Good news! You have been *promoted to Admin*.

Promoted by: ${req.user.email}

You can now manage users, todos, and system activities.

If you think this action was not intended, please contact support.

Regards,
To-Do App Team`
      );
    } catch (emailErr) {
      logger.error('Promotion email failed:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: `User '${user.email}' promoted to admin`,
    });
  } catch (error) {
    await t.rollback();
    logger.error('promoteUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.demoteUserByAdmin = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { transaction: t });

    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: 'User is already a normal user' });
    }

    await user.update({ role: 'user' }, { transaction: t });

    await ActivityLog.create(
      {
        userId: req.user?.id,
        action: 'DEMOTE_USER',
        details: `Admin ${req.user.email} demoted ${user.email} from admin.`,
        timestamp: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    try {
      await sendEmail(
        user.email,
        '⚠️ Your Admin Privileges Have Been Updated',
        `Hello ${user.name || user.email},

Your admin privileges have been revoked by the administrator:

Changed by: ${req.user.email}

You are now a normal user. You still have full access to your todos and profile.

If this wasn’t expected, please reach out to support.

Regards,
To-Do App Team`
      );
    } catch (emailErr) {
      logger.error('Demotion email failed:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: `Admin '${user.email}' demoted to user`,
    });
  } catch (error) {
    await t.rollback();
    logger.error('demoteUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
