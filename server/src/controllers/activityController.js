const activityService = require('../services/activityService');

exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 5 } = req.query;

    const data = await activityService.getUserActivityLogs(userId, page, limit);

    return res.status(200).json({
      success: true,
      logs: data.logs,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalLogs: data.totalLogs,
    });
  } catch (error) {
    console.error('❌ Error fetching user activity logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
    });
  }
};
