const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await ActivityLog.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
    });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
