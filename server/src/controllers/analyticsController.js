const { fn, col, Op } = require('sequelize');
const Todo = require('../models/Todo');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // filter for both admin & user
    const filter = {
      [Op.or]: [{ userId }, { assignedToUserId: userId }],
    };

    // Default structure
    const defaults = {
      statusCounts: { completed: 0, inProgress: 0, pending: 0 },
      priorityCounts: { High: 0, Moderate: 0, Low: 0 },
      categoryCounts: { Work: 0, Personal: 0, Other: 0 },
    };

    // Generic aggregator
    const aggregateBy = async (field) => {
      const rows = await Todo.findAll({
        where: filter,
        attributes: [field, [fn('COUNT', col(field)), 'count']],
        group: [field],
        raw: true,
        paranoid: true,
      });

      return Object.fromEntries(
        rows.map((r) => [r[field], parseInt(r.count, 10)])
      );
    };

    const [statusCounts, priorityCounts, categoryCounts, totalTodos] =
      await Promise.all([
        aggregateBy('status'),
        aggregateBy('priority'),
        aggregateBy('category'),
        Todo.count({ where: filter, paranoid: true }), // 🔥 FIXED
      ]);

    const mergeCounts = (defaults, actual) =>
      Object.fromEntries(Object.keys(defaults).map((k) => [k, actual[k] || 0]));

    const mergedStatus = mergeCounts(defaults.statusCounts, statusCounts);
    const mergedPriority = mergeCounts(defaults.priorityCounts, priorityCounts);
    const mergedCategory = mergeCounts(defaults.categoryCounts, categoryCounts);

    const calcPercent = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          totalTodos ? ((v / totalTodos) * 100).toFixed(1) : 0,
        ])
      );

    return res.status(200).json({
      success: true,
      totalTodos,
      statusCounts: mergedStatus,
      priorityCounts: mergedPriority,
      categoryCounts: mergedCategory,
      statusPercentages: calcPercent(mergedStatus),
      priorityPercentages: calcPercent(mergedPriority),
      categoryPercentages: calcPercent(mergedCategory),
    });
  } catch (error) {
    console.error('❌ getAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
