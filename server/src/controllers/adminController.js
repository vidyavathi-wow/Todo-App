const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Todo = require('../models/Todo');

exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
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
    return res.status(500).json({ success: false, message: 'Server error' });
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
          attributes: ['id', 'name', 'email', 'role'],
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
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
        .status(403)
        .json({ success: false, message: 'Admins cannot delete other admins' });
    }

    await Todo.destroy({ where: { userId: id }, transaction: t });
    await ActivityLog.destroy({ where: { userId: id }, transaction: t });

    await user.destroy({ transaction: t });

    await ActivityLog.create(
      {
        userId: req.user?.id || null,
        action: 'DELETE_USER',
        details: `Admin ${req.user?.email || 'Unknown'} deleted user ${user.email} and related data.`,
        timestamp: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `User '${user.email}' and related data deleted successfully.`,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};
