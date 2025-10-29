const Todo = require('../models/Todo');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.findAll({ where: { userId } });
    const statusCounts = {
      completed: todos.filter((t) => t.status === 'completed').length,
      inProgress: todos.filter((t) => t.status === 'inProgress').length,
      pending: todos.filter((t) => t.status === 'pending').length,
    };
    const priorityCounts = {
      High: todos.filter((t) => t.priority === 'High').length,
      Moderate: todos.filter((t) => t.priority === 'Moderate').length,
      Low: todos.filter((t) => t.priority === 'Low').length,
    };
    const categoryCounts = {
      Work: todos.filter((t) => t.category === 'Work').length,
      Personal: todos.filter((t) => t.category === 'Personal').length,
      Other: todos.filter((t) => t.category === 'Other').length,
    };
    const totalTodos = todos.length || 1;
    const statusPercentages = Object.fromEntries(
      Object.entries(statusCounts).map(([k, v]) => [
        k,
        ((v / totalTodos) * 100).toFixed(1),
      ])
    );

    const priorityPercentages = Object.fromEntries(
      Object.entries(priorityCounts).map(([k, v]) => [
        k,
        ((v / totalTodos) * 100).toFixed(1),
      ])
    );

    const categoryPercentages = Object.fromEntries(
      Object.entries(categoryCounts).map(([k, v]) => [
        k,
        ((v / totalTodos) * 100).toFixed(1),
      ])
    );

    res.status(200).json({
      success: true,
      totalTodos: todos.length,
      statusCounts,
      priorityCounts,
      categoryCounts,
      statusPercentages,
      priorityPercentages,
      categoryPercentages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
