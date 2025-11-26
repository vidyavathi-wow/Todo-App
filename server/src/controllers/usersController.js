const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const offset = (page - 1) * limit;
    const isAdmin = req.user?.role === 'admin';

    const { count, rows: users } = await User.findAndCountAll({
      attributes: isAdmin
        ? ['id', 'name', 'email'] // Admin sees email
        : ['id', 'name'], // Non-admin sees only name
      limit,
      offset,
      order: [['name', 'ASC']],
      paranoid: true, // Only active users (no soft-deleted)
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalUsers: count,
      users,
    });
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};
