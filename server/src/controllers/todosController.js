const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const ActivityLog = require('../models/ActivityLog');
const { fn, col } = require('sequelize');

exports.createTodo = async (req, res) => {
  try {
    const { title, description, status, date, category, priority, notes } =
      req.body;
    const userId = req.user.id;

    const todo = await Todo.create({
      title,
      description,
      status,
      date,
      category,
      priority,
      notes,
      userId,
    });

    logger.info(`Todo created by user ${userId}: ${title}`);

    try {
      await ActivityLog.create({
        userId,
        action: 'CREATE_TODO',
        details: `Created todo: ${title}`,
      });
    } catch (logError) {
      logger.warn(`ActivityLog failed (createTodo): ${logError.message}`);
    }

    const { id } = todo;
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      todo: { id, title, description, status, date, category, priority, notes },
    });
  } catch (error) {
    logger.error(`Error in createTodo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.findAll({
      where: { userId, isDeleted: false },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'title',
        'description',
        'status',
        'date',
        'category',
        'priority',
        'notes',
        'createdAt',
      ],
    });

    logger.info(`Fetched todos for user ${userId}`);
    res.status(200).json({ success: true, todos });
  } catch (error) {
    logger.error(`Error in getAllTodos: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, userId, isDeleted: false },
      attributes: [
        'id',
        'title',
        'description',
        'status',
        'date',
        'category',
        'priority',
        'notes',
        'createdAt',
      ],
    });

    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });

    logger.info(`Todo fetched: ${id}`);
    res.status(200).json({ success: true, todo });
  } catch (error) {
    logger.error(`Error in getTodo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, category, priority, notes, status } =
      req.body;

    const todo = await Todo.findOne({
      where: { id, userId, isDeleted: false },
    });

    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });

    await todo.update({
      title,
      description,
      date,
      category,
      priority,
      notes,
      status,
    });

    try {
      await ActivityLog.create({
        userId,
        action: 'UPDATE_TODO',
        details: `Updated todo: ${title || id}`,
      });
    } catch (logError) {
      logger.warn(`ActivityLog failed (updateTodo): ${logError.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      todo: { id, title, description, status, date, category, priority, notes },
    });
  } catch (error) {
    logger.error(`Error in updateTodo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [updated] = await Todo.update(
      { isDeleted: true },
      { where: { id, userId, isDeleted: false } }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });

    try {
      await ActivityLog.create({
        userId,
        action: 'DELETE_TODO',
        details: `deleted todo with id: ${id}`,
      });
    } catch (logError) {
      logger.warn(`ActivityLog failed (deleteTodo): ${logError.message}`);
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully (soft delete)',
    });
  } catch (error) {
    logger.error(`Error in deleteTodo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const [statusCounts, recentTodos] = await Promise.all([
      Todo.findAll({
        attributes: ['status', [fn('COUNT', col('status')), 'count']],
        where: { userId, isDeleted: false },
        group: ['status'],
        raw: true,
      }),
      Todo.findAll({
        where: { userId, isDeleted: false },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: [
          'id',
          'title',
          'description',
          'status',
          'date',
          'category',
          'priority',
          'notes',
        ],
      }),
    ]);

    const overviewData = { completed: 0, inProgress: 0, pending: 0 };
    statusCounts.forEach(({ status, count }) => {
      if (overviewData.hasOwnProperty(status)) {
        overviewData[status] = Number(count);
      }
    });

    logger.info(`✅ Dashboard data fetched for user ${userId}`);

    res.status(200).json({
      success: true,
      overviewData,
      recentTodos,
    });
  } catch (error) {
    logger.error(`❌ Error in getDashboardData: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: error.message,
    });
  }
};
