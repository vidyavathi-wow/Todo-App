const Todo = require('../models/Todo');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');
const { fn, col, Op } = require('sequelize');
const sequelize = require('../config/db');
const sendEmail = require('../config/emailServeice');
const taskAssignedEmail = require('../emails/taskAssigned');
const taskUpdatedEmail = require('../emails/taskUpdated');

// -------------------------------------------------------------
// CREATE TODO
// -------------------------------------------------------------
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

    let assignedUsername = '';
    if (assignedToUserId) {
      const assignedUser = await User.findByPk(assignedToUserId);
      assignedUsername = assignedUser ? assignedUser.name : '';
    }

    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE_TODO',
      details: `Todo created: ${title}${
        assignedUsername ? ` (assigned to ${assignedUsername})` : ''
      }`,
    });

    const createdTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (assignedToUserId) {
      const assignedUser = await User.findByPk(assignedToUserId);
      const assignedBy = await User.findByPk(req.user.id);

      if (assignedUser && assignedUser.email) {
        const { subject, text } = taskAssignedEmail(
          assignedUser,
          assignedBy,
          createdTodo
        );
        await sendEmail(assignedUser.email, subject, text);
      }
    }

    res.status(201).json({ success: true, todo: createdTodo });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// GET ALL TODOS (ADMIN = ALL, USER = OWN + ASSIGNED) + PAGINATION
// -------------------------------------------------------------
exports.getAllTodos = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const offset = (page - 1) * limit;

    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const where = isAdmin
      ? {}
      : { [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const { count, rows: todos } = await Todo.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalTodos: count,
      todos,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// GET TODO BY ID
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// UPDATE TODO
// -------------------------------------------------------------
exports.updateTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const where = isAdmin ? { id } : { id, userId };
    const existingTodo = await Todo.findOne({ where, transaction: t });

    if (!existingTodo) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });
    }

    const oldTodo = existingTodo.toJSON();
    await existingTodo.update(req.body, { transaction: t });

    const updatedTodo = await Todo.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    const assignedToOld = oldTodo.assignedToUserId;
    const assignedToNew = updatedTodo.assignedToUserId;

    const updatedBy = await User.findByPk(req.user.id);

    if (assignedToOld !== assignedToNew && assignedToNew) {
      const newAssignee = await User.findByPk(assignedToNew);
      const { subject, text } = taskAssignedEmail(
        newAssignee,
        updatedBy,
        updatedTodo
      );
      await sendEmail(newAssignee.email, subject, text);
    }

    if (assignedToNew) {
      const assignee = await User.findByPk(assignedToNew);
      const { subject, text } = taskUpdatedEmail(
        assignee,
        updatedBy,
        oldTodo,
        updatedTodo
      );
      await sendEmail(assignee.email, subject, text);
    }

    await t.commit();
    res.status(200).json({ success: true, todo: updatedTodo });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// UPDATE TODO STATUS
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// DELETE TODO
// -------------------------------------------------------------
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const where = isAdmin
      ? { id }
      : {
          id,
          [Op.or]: [{ userId }, { assignedToUserId: userId }],
        };

    const deleted = await Todo.destroy({ where });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found or no permission',
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// GET TODOS BY DATE (Paginated + Filters)
// -------------------------------------------------------------
exports.getTodosByDate = async (req, res) => {
  try {
    const { date, filter = 'my', page = 1, limit = 20 } = req.query;

    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    if (!date)
      return res
        .status(400)
        .json({ success: false, message: 'Date is required' });

    const p = Number(page);
    const l = Number(limit);
    const offset = (p - 1) * l;

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const dateCondition = { date: { [Op.between]: [start, end] } };

    let where;

    switch (filter) {
      case 'my':
      case 'assignedByMe':
        where = { ...dateCondition, userId };
        break;

      case 'assignedToMe':
        where = { ...dateCondition, assignedToUserId: userId };
        break;

      case 'all':
      default:
        where = isAdmin
          ? dateCondition
          : {
              [Op.and]: [
                dateCondition,
                { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
              ],
            };
        break;
    }

    const { count, rows: todos } = await Todo.findAndCountAll({
      where,
      offset,
      limit: l,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(200).json({
      success: true,
      currentPage: p,
      totalPages: Math.ceil(count / l),
      totalTodos: count,
      todos,
    });
  } catch (error) {
    logger.error('getTodosByDate error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch todos by date' });
  }
};

// -------------------------------------------------------------
// GET TODOS BY DATE RANGE (Month Summary)
// -------------------------------------------------------------
exports.getTodosByDateRange = async (req, res) => {
  try {
    const { start, end, filter = 'my' } = req.query;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    if (!start || !end)
      return res
        .status(400)
        .json({ success: false, message: 'Start and end dates required' });

    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateCondition = { date: { [Op.between]: [startDate, endDate] } };

    let where;

    switch (filter) {
      case 'my':
      case 'assignedByMe':
        where = { ...dateCondition, userId };
        break;

      case 'assignedToMe':
        where = { ...dateCondition, assignedToUserId: userId };
        break;

      case 'all':
      default:
        where = isAdmin
          ? dateCondition
          : {
              [Op.and]: [
                dateCondition,
                { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
              ],
            };
        break;
    }

    const todos = await Todo.findAll({
      where,
      attributes: ['id', 'date', 'status'],
      raw: true,
    });

    const taskSummary = todos.reduce((acc, todo) => {
      const dateKey = todo.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(todo);
      return acc;
    }, {});

    return res.status(200).json({ success: true, taskSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    statusCounts.forEach(({ status, count }) => {
      overviewData[status] = Number(count);
    });

    return res.status(200).json({
      success: true,
      overviewData,
      recentTodos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
