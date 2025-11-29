const ActivityLog = require('../models/ActivityLog');

module.exports = {
  // ---------------------------------------------------------
  // GET PAGINATED ACTIVITY LOGS FOR CURRENT USER
  // ---------------------------------------------------------
  getUserLogs: async (userId, page = 1, limit = 5) => {
    const p = Math.max(Number(page), 1);
    const l = Math.max(Number(limit), 1);

    const offset = (p - 1) * l;

    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      where: { userId },
      attributes: ['id', 'action', 'details', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit: l,
      offset,
    });

    return {
      logs,
      currentPage: p,
      totalPages: Math.ceil(count / l),
      totalLogs: count,
    };
  },
};
