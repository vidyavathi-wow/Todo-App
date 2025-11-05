const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 5 } = req.query;

    // Convert to numbers and handle invalid values
    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);
    const offset = (page - 1) * limit;

    // Fetch logs with pagination
    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      where: { userId },
      attributes: ['id', 'action', 'details', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      logs,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalLogs: count,
    });
  } catch (error) {
    console.error('❌ Error fetching user activity logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
};
