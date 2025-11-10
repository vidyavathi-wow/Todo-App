const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const ActivityLog = require('../models/ActivityLog');
const { fn, col } = require('sequelize');
const sequelize = require('../config/db');

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

    await ActivityLog.create({
      userId,
      action: 'CREATE_TODO',
      details: `Created todo: ${title}`,
    });

    logger.info(`✅ Todo created by user ${userId}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      todo,
    });
  } catch (error) {
    logger.error(`❌ Error in createTodo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating todo',
    });
  }
};

exports.getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      paranoid: true,
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

    res.status(200).json({ success: true, todos });
  } catch (error) {
    logger.error(`❌ Error in getAllTodos: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch todos' });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, userId },
      paranoid: true,
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

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    res.status(200).json({ success: true, todo });
  } catch (error) {
    logger.error(`❌ Error in getTodo: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch todo' });
  }
};

exports.updateTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, category, priority, notes, status } =
      req.body;

    const todo = await Todo.findOne({ where: { id, userId }, transaction: t });

    if (!todo) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    await todo.update(
      { title, description, date, category, priority, notes, status },
      { transaction: t }
    );

    await ActivityLog.create(
      {
        userId,
        action: 'UPDATE_TODO',
        details: `Updated todo: ${title || id}`,
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .json({ success: true, message: 'Todo updated successfully', todo });
  } catch (error) {
    await t.rollback();
    logger.error(`❌ Error in updateTodo: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({ where: { id, userId }, transaction: t });

    if (!todo) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    await todo.destroy({ transaction: t });
    await ActivityLog.create(
      {
        userId,
        action: 'DELETE_TODO',
        details: `Soft deleted ${todo.title} todo`,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: 'Todo soft deleted successfully' });
  } catch (error) {
    await t.rollback();
    logger.error(`❌ Error in deleteTodo: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to delete todo' });
  }
};

exports.updateTodoStatus = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });

    todo.status = req.body.status;
    await todo.save();

    res.json({ success: true, message: 'Todo status updated', todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, userId },
      paranoid: false,
      transaction: t,
    });

    if (!todo || !todo.deletedAt) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'No deleted todo found' });
    }

    await todo.restore({ transaction: t });
    await ActivityLog.create(
      {
        userId,
        action: 'RESTORE_TODO',
        details: `Restored todo with id: ${id}`,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: 'Todo restored successfully' });
  } catch (error) {
    await t.rollback();
    logger.error(`❌ Error in restoreTodo: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to restore todo' });
  }
};

/**
 * Permanently delete a todo (admin use only)
 */
exports.forceDeleteTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id },
      paranoid: false,
      transaction: t,
    });
    if (!todo) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    await todo.destroy({ force: true, transaction: t }); // permanently remove
    await ActivityLog.create(
      {
        userId,
        action: 'FORCE_DELETE_TODO',
        details: `Permanently deleted todo with id: ${id}`,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: 'Todo permanently deleted' });
  } catch (error) {
    await t.rollback();
    logger.error(`❌ Error in forceDeleteTodo: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: 'Failed to permanently delete todo' });
  }
};

/**
 * Dashboard summary for a user
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const [statusCounts, recentTodos] = await Promise.all([
      Todo.findAll({
        attributes: ['status', [fn('COUNT', col('status')), 'count']],
        where: { userId },
        group: ['status'],
        paranoid: true,
        raw: true,
      }),
      Todo.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        paranoid: true,
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

    res.status(200).json({
      success: true,
      overviewData,
      recentTodos,
    });
  } catch (error) {
    logger.error(`❌ Error in getDashboardData: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};
