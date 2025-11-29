const Todo = require('../models/Todo');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const sequelize = require('../config/db');
const { Op, fn, col } = require('sequelize');
const sendEmail = require('../config/emailServeice');
const taskAssignedEmail = require('../emails/taskAssigned');
const taskUpdatedEmail = require('../emails/taskUpdated');

module.exports = {
  // ---------------------------------------------------------
  // CREATE TODO
  // ---------------------------------------------------------
  createTodo: async (reqUser, data) => {
    let userId = reqUser.id;
    if (data.userId && reqUser.role === 'admin') {
      userId = data.userId;
    }

    const todo = await Todo.create({
      ...data,
      userId,
      assignedToUserId: data.assignedToUserId || null,
    });

    // add log
    await ActivityLog.create({
      userId: reqUser.id,
      action: 'CREATE_TODO',
      details: `Todo created: ${todo.title}${
        data.assignedToUserId ? ` (assigned)` : ''
      }`,
    });

    const createdTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    // email notifications
    if (data.assignedToUserId) {
      const assignedUser = await User.findByPk(data.assignedToUserId);
      const assignedBy = await User.findByPk(reqUser.id);

      if (assignedUser?.email) {
        const { subject, text } = taskAssignedEmail(
          assignedUser,
          assignedBy,
          createdTodo
        );
        await sendEmail(assignedUser.email, subject, text);
      }
    }

    return createdTodo;
  },

  // ---------------------------------------------------------
  // GET ALL TODOS (Paginated)
  // ---------------------------------------------------------
  getAllTodos: async (reqUser, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

    const where = isAdmin
      ? {}
      : { [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const { count, rows } = await Todo.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalTodos: count,
      todos: rows,
    };
  },

  // ---------------------------------------------------------
  // GET TODO BY ID
  // ---------------------------------------------------------
  getTodoById: async (reqUser, id) => {
    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

    const where = isAdmin
      ? { id }
      : { id, [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    return await Todo.findOne({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });
  },

  // ---------------------------------------------------------
  // UPDATE TODO
  // ---------------------------------------------------------
  updateTodo: async (reqUser, id, body) => {
    return await sequelize.transaction(async (t) => {
      const isAdmin = reqUser.role === 'admin';
      const userId = reqUser.id;

      const where = isAdmin ? { id } : { id, userId };
      const existing = await Todo.findOne({ where, transaction: t });

      if (!existing) throw new Error('Todo not found');

      const oldTodo = existing.toJSON();
      await existing.update(body, { transaction: t });

      const updated = await Todo.findByPk(id, {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        ],
      });

      // send assignment/updated emails
      const oldAssigned = oldTodo.assignedToUserId;
      const newAssigned = updated.assignedToUserId;

      const updatedBy = await User.findByPk(reqUser.id);

      if (oldAssigned !== newAssigned && newAssigned) {
        const newUser = await User.findByPk(newAssigned);
        const { subject, text } = taskAssignedEmail(
          newUser,
          updatedBy,
          updated
        );
        await sendEmail(newUser.email, subject, text);
      }

      if (newAssigned) {
        const user = await User.findByPk(newAssigned);
        const { subject, text } = taskUpdatedEmail(
          user,
          updatedBy,
          oldTodo,
          updated
        );
        await sendEmail(user.email, subject, text);
      }

      return updated;
    });
  },

  // ---------------------------------------------------------
  // UPDATE TODO STATUS
  // ---------------------------------------------------------
  updateStatus: async (id, status) => {
    const todo = await Todo.findByPk(id);
    if (!todo) throw new Error('Todo not found');

    todo.status = status;
    await todo.save();

    return await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });
  },

  // ---------------------------------------------------------
  // DELETE TODO
  // ---------------------------------------------------------
  deleteTodo: async (reqUser, id) => {
    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

    const where = isAdmin
      ? { id }
      : { id, [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const deleted = await Todo.destroy({ where });

    if (!deleted) throw new Error('Todo not found or no permission');

    return 'Todo deleted successfully';
  },

  // ---------------------------------------------------------
  // GET TODOS BY DATE
  // ---------------------------------------------------------
  getTodosByDate: async (reqUser, args) => {
    let { date, filter, page, limit } = args;

    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

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

      default:
        where = isAdmin
          ? dateCondition
          : {
              [Op.and]: [
                dateCondition,
                { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
              ],
            };
    }

    const { count, rows } = await Todo.findAndCountAll({
      where,
      offset,
      limit: l,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    return {
      currentPage: p,
      totalPages: Math.ceil(count / l),
      totalTodos: count,
      todos: rows,
    };
  },

  // ---------------------------------------------------------
  // GET DATE RANGE SUMMARY
  // ---------------------------------------------------------
  getTodosByDateRange: async (reqUser, args) => {
    const { start, end, filter } = args;
    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

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

      default:
        where = isAdmin
          ? dateCondition
          : {
              [Op.and]: [
                dateCondition,
                { [Op.or]: [{ userId }, { assignedToUserId: userId }] },
              ],
            };
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

    return taskSummary;
  },

  // ---------------------------------------------------------
  // DASHBOARD DATA
  // ---------------------------------------------------------
  getDashboardData: async (reqUser) => {
    const isAdmin = reqUser.role === 'admin';
    const userId = reqUser.id;

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

    return { overviewData, recentTodos };
  },
};
