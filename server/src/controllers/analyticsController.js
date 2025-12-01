const analyticsService = require('../services/analyticsService');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await analyticsService.getAnalyticsData(userId);

    return res.status(200).json({
      success: true,
      totalTodos: data.totalTodos,
      statusCounts: data.mergedStatus,
      priorityCounts: data.mergedPriority,
      categoryCounts: data.mergedCategory,
      statusPercentages: data.statusPercentages,
      priorityPercentages: data.priorityPercentages,
      categoryPercentages: data.categoryPercentages,
    });
  } catch (error) {
    console.error('❌ getAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
