const ActivityLog = require('../models/ActivityLog');

module.exports = {
  getUserActivityLogs: async (userId, page = 1, limit = 5) => {
    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      where: { userId },
      attributes: ['id', 'action', 'details', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });

    return {
      logs,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalLogs: count,
    };
  },
};
