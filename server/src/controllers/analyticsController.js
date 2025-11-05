const { fn, col } = require('sequelize');
const Todo = require('../models/Todo');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Run all aggregations simultaneously
    const [statusData, priorityData, categoryData, totalTodos] =
      await Promise.all([
        Todo.findAll({
          attributes: ['status', [fn('COUNT', col('status')), 'count']],
          where: { userId },
          group: ['status'],
          paranoid: true, // ✅ exclude soft-deleted todos
        }),
        Todo.findAll({
          attributes: ['priority', [fn('COUNT', col('priority')), 'count']],
          where: { userId },
          group: ['priority'],
          paranoid: true,
        }),
        Todo.findAll({
          attributes: ['category', [fn('COUNT', col('category')), 'count']],
          where: { userId },
          group: ['category'],
          paranoid: true,
        }),
        Todo.count({ where: { userId }, paranoid: true }),
      ]);

    // No todos found case
    if (totalTodos === 0) {
      return res.status(200).json({
        success: true,
        totalTodos: 0,
        statusCounts: { completed: 0, inProgress: 0, pending: 0 },
        priorityCounts: { High: 0, Moderate: 0, Low: 0 },
        categoryCounts: { Work: 0, Personal: 0, Other: 0 },
        statusPercentages: { completed: 0, inProgress: 0, pending: 0 },
        priorityPercentages: { High: 0, Moderate: 0, Low: 0 },
        categoryPercentages: { Work: 0, Personal: 0, Other: 0 },
      });
    }

    // Helper: Convert Sequelize result into { key: count } object
    const formatResult = (data, keys) => {
      const result = Object.fromEntries(keys.map((k) => [k, 0]));
      data.forEach((item) => {
        const [keyName] = Object.keys(item.dataValues).filter(
          (k) => k !== 'count'
        );
        const key = item.getDataValue(keyName);
        if (key) result[key] = parseInt(item.getDataValue('count'));
      });
      return result;
    };

    // Format aggregated data
    const statusCounts = formatResult(statusData, [
      'completed',
      'inProgress',
      'pending',
    ]);
    const priorityCounts = formatResult(priorityData, [
      'High',
      'Moderate',
      'Low',
    ]);
    const categoryCounts = formatResult(categoryData, [
      'Work',
      'Personal',
      'Other',
    ]);

    // Helper: Calculate % of total
    const calcPercentages = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          totalTodos > 0 ? ((v / totalTodos) * 100).toFixed(1) : 0,
        ])
      );

    // ✅ Final analytics response
    res.status(200).json({
      success: true,
      totalTodos,
      statusCounts,
      priorityCounts,
      categoryCounts,
      statusPercentages: calcPercentages(statusCounts),
      priorityPercentages: calcPercentages(priorityCounts),
      categoryPercentages: calcPercentages(categoryCounts),
    });
  } catch (error) {
    console.error('❌ Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
