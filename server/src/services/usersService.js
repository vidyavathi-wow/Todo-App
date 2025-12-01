const User = require('../models/User');

module.exports = {
  listUsers: async (user, query) => {
    let { page = 1, limit = 10 } = query;

    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const offset = (page - 1) * limit;
    const isAdmin = user?.role === 'admin';

    try {
      const { count, rows: users } = await User.findAndCountAll({
        attributes: isAdmin ? ['id', 'name', 'email'] : ['id', 'name'],
        limit,
        offset,
        order: [['name', 'ASC']],
        paranoid: true,
      });

      return {
        status: 200,
        data: {
          success: true,
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          users,
        },
      };
    } catch (error) {
      console.error('listUsers error:', error);
      return {
        status: 500,
        data: {
          success: false,
          message: 'Failed to fetch users',
        },
      };
    }
  },
};
