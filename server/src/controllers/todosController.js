const Todo = require('../models/Todo');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');
const { fn, col, Op } = require('sequelize');
const sequelize = require('../config/db');

exports.createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      date,
      category,
      priority,
      notes,
      assignedToUserId,
    } = req.body;
    let userId = req.user.id;

    if (req.body.userId && req.user.role === 'admin') {
      userId = req.body.userId;
    }

    const todo = await Todo.create({
      title,
      description,
      status,
      date,
      category,
      priority,
      notes,
      userId,
      assignedToUserId: assignedToUserId || null,
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE_TODO',
      details: `Todo created: ${title}${assignedToUserId ? ` (assigned to #${assignedToUserId})` : ''}`,
    });

    const createdTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(201).json({ success: true, todo: createdTodo });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllTodos = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const where = isAdmin
      ? {}
      : { [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const todos = await Todo.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({ success: true, todos });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const where = isAdmin
      ? { id }
      : { id, [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const todo = await Todo.findOne({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });

    res.status(200).json({ success: true, todo });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const where = isAdmin ? { id } : { id, userId };
    const todo = await Todo.findOne({ where, transaction: t });

    if (!todo) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    await todo.update(req.body, { transaction: t });

    await ActivityLog.create(
      { userId, action: 'UPDATE_TODO', details: `Updated todo: ${todo.title}` },
      { transaction: t }
    );

    await t.commit();
    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({ success: true, todo: updatedTodo });
  } catch (err) {
    await t.rollback();
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTodoStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const todo = await Todo.findByPk(req.params.id);

    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });

    todo.status = status;
    await todo.save();

    const updated = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.json({ success: true, todo: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE TODO
exports.deleteTodo = async (req, res) => {
  try {
    await Todo.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DASHBOARD
exports.getDashboardData = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const where = isAdmin
      ? {}
      : { [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const [statusCounts, recentTodos] = await Promise.all([
      Todo.findAll({
        attributes: ['status', [fn('COUNT', col('status')), 'count']],
        where,
        group: ['status'],
        raw: true,
      }),
      Todo.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
      }),
    ]);

    const overviewData = { completed: 0, inProgress: 0, pending: 0 };
    statusCounts.forEach(
      ({ status, count }) => (overviewData[status] = Number(count))
    );

    res.status(200).json({ success: true, overviewData, recentTodos });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET TODOS BY DATE
exports.getTodosByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    if (!date)
      return res
        .status(400)
        .json({ success: false, message: 'Date is required' });

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const where = isAdmin
      ? { date: { [Op.between]: [start, end] } }
      : {
          [Op.and]: [
            { date: { [Op.between]: [start, end] } },
            { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
          ],
        };

    const todos = await Todo.findAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, todos });
  } catch (error) {
    logger.error('getTodosByDate error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch todos by date' });
  }
};

// ✅ GET TODOS BY DATE RANGE (for calendar dots)
exports.getTodosByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    if (!start || !end)
      return res
        .status(400)
        .json({ success: false, message: 'Start and end dates required' });

    const where = isAdmin
      ? { date: { [Op.between]: [new Date(start), new Date(end)] } }
      : {
          [Op.and]: [
            { date: { [Op.between]: [new Date(start), new Date(end)] } },
            { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
          ],
        };

    const todos = await Todo.findAll({
      where,
      attributes: ['id', 'date', 'status'],
      raw: true,
    });

    const taskSummary = todos.reduce((acc, todo) => {
      const date = todo.date.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(todo);
      return acc;
    }, {});

    res.status(200).json({ success: true, taskSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
