const { fn, col, Op } = require('sequelize');
const Todo = require('../models/Todo');

module.exports = {
  // ---------------------------------------------------------
  // GET ANALYTICS FOR CURRENT USER
  // ---------------------------------------------------------
  getUserAnalytics: async (userId) => {
    const filter = {
      [Op.or]: [{ userId }, { assignedToUserId: userId }],
    };

    // Expected default keys
    const defaults = {
      statusCounts: { completed: 0, inProgress: 0, pending: 0 },
      priorityCounts: { High: 0, Moderate: 0, Low: 0 },
      categoryCounts: { Work: 0, Personal: 0, Other: 0 },
    };

    // Generic function to aggregate counts by field
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
        Todo.count({ where: filter, paranoid: true }),
      ]);

    // Merge default structure with actual DB results
    const mergeCounts = (defaultsObj, actualObj) =>
      Object.fromEntries(
        Object.keys(defaultsObj).map((k) => [k, actualObj[k] || 0])
      );

    const mergedStatus = mergeCounts(defaults.statusCounts, statusCounts);
    const mergedPriority = mergeCounts(defaults.priorityCounts, priorityCounts);
    const mergedCategory = mergeCounts(defaults.categoryCounts, categoryCounts);

    // Convert to percentages
    const calcPercent = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          totalTodos ? ((v / totalTodos) * 100).toFixed(1) : 0,
        ])
      );

    return {
      totalTodos,
      statusCounts: mergedStatus,
      priorityCounts: mergedPriority,
      categoryCounts: mergedCategory,
      statusPercentages: calcPercent(mergedStatus),
      priorityPercentages: calcPercent(mergedPriority),
      categoryPercentages: calcPercent(mergedCategory),
    };
  },
};
