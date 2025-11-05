const { fn, col } = require('sequelize');
const Todo = require('../models/Todo');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const [statusData, priorityData, categoryData, totalTodos] =
      await Promise.all([
        Todo.findAll({
          attributes: ['status', [fn('COUNT', col('status')), 'count']],
          where: { userId, isDeleted: false },
          group: ['status'],
        }),
        Todo.findAll({
          attributes: ['priority', [fn('COUNT', col('priority')), 'count']],
          where: { userId, isDeleted: false },
          group: ['priority'],
        }),
        Todo.findAll({
          attributes: ['category', [fn('COUNT', col('category')), 'count']],
          where: { userId, isDeleted: false },
          group: ['category'],
        }),
        Todo.count({ where: { userId, isDeleted: false } }),
      ]);

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

    const formatResult = (data, keys) => {
      const result = Object.fromEntries(keys.map((k) => [k, 0]));
      data.forEach((item) => {
        const [keyName] = Object.keys(item.dataValues).filter(
          (k) => k !== 'count'
        );
        const key = item.getDataValue(keyName);
        result[key] = parseInt(item.getDataValue('count'));
      });
      return result;
    };

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

    const calcPercentages = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          ((v / totalTodos) * 100).toFixed(1),
        ])
      );

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
