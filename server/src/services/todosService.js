const { fn, col, Op } = require('sequelize');
const sequelize = require('../config/db');
const Todo = require('../models/Todo');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const sendEmail = require('../config/emailServeice');
const taskAssignedEmail = require('../emails/taskAssigned');
const taskUpdatedEmail = require('../emails/taskUpdated');

module.exports = {
  // -------------------------------------------------------------
  // CREATE TODO
  // -------------------------------------------------------------
  createTodo: async (user, body) => {
    const {
      title,
      description,
      status,
      date,
      category,
      priority,
      notes,
      assignedToUserId,
    } = body;

    let userId = user.id;

    if (body.userId && user.role === 'admin') {
      userId = body.userId;
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
      userId: user.id,
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
      const assignedBy = await User.findByPk(user.id);

      if (assignedUser && assignedUser.email) {
        const { subject, text } = taskAssignedEmail(
          assignedUser,
          assignedBy,
          createdTodo
        );
        await sendEmail(assignedUser.email, subject, text);
      }
    }

    return {
      status: 201,
      data: { success: true, todo: createdTodo },
    };
  },

  // -------------------------------------------------------------
  // GET ALL TODOS (ADMIN = ALL, USER = OWN + ASSIGNED) + PAGINATION
  // -------------------------------------------------------------
  getAllTodos: async (user, query) => {
    let { page = 1, limit = 10 } = query;

    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const offset = (page - 1) * limit;

    const isAdmin = user.role === 'admin';
    const userId = user.id;

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

    return {
      status: 200,
      data: {
        success: true,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalTodos: count,
        todos,
      },
    };
  },

  // -------------------------------------------------------------
  // GET TODO BY ID
  // -------------------------------------------------------------
  getTodo: async (user, todoId) => {
    const userId = user.id;
    const isAdmin = user.role === 'admin';

    const where = isAdmin
      ? { id: todoId }
      : { id: todoId, [Op.or]: [{ userId }, { assignedToUserId: userId }] };

    const todo = await Todo.findOne({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!todo) {
      return {
        status: 404,
        error: 'Todo not found',
      };
    }

    return {
      status: 200,
      data: { success: true, todo },
    };
  },

  // -------------------------------------------------------------
  // UPDATE TODO
  // -------------------------------------------------------------
  updateTodo: async (user, todoId, body) => {
    const t = await sequelize.transaction();

    try {
      const userId = user.id;
      const isAdmin = user.role === 'admin';

      const where = isAdmin ? { id: todoId } : { id: todoId, userId };
      const existingTodo = await Todo.findOne({ where, transaction: t });

      if (!existingTodo) {
        await t.rollback();
        return {
          status: 404,
          error: 'Todo not found',
        };
      }

      const oldTodo = existingTodo.toJSON();
      await existingTodo.update(body, { transaction: t });

      const updatedTodo = await Todo.findByPk(todoId, {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        ],
      });

      const assignedToOld = oldTodo.assignedToUserId;
      const assignedToNew = updatedTodo.assignedToUserId;

      const updatedBy = await User.findByPk(user.id);

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

      return {
        status: 200,
        data: { success: true, todo: updatedTodo },
      };
    } catch (err) {
      await t.rollback();
      throw err; // controller will return 500 with err.message
    }
  },

  // -------------------------------------------------------------
  // UPDATE TODO STATUS
  // -------------------------------------------------------------
  updateTodoStatus: async (todoId, body) => {
    const { status } = body;
    const todo = await Todo.findByPk(todoId);

    if (!todo) {
      return {
        status: 404,
        error: 'Todo not found',
      };
    }

    todo.status = status;
    await todo.save();

    const updated = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    // original used res.json(...) => status 200
    return {
      status: 200,
      data: { success: true, todo: updated },
    };
  },

  // -------------------------------------------------------------
  // DELETE TODO
  // -------------------------------------------------------------
  deleteTodo: async (user, todoId) => {
    const isAdmin = user.role === 'admin';
    const userId = user.id;

    const where = isAdmin
      ? { id: todoId }
      : {
          id: todoId,
          [Op.or]: [{ userId }, { assignedToUserId: userId }],
        };

    const deleted = await Todo.destroy({ where });

    if (!deleted) {
      return {
        status: 404,
        error: 'Todo not found or no permission',
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        message: 'Todo deleted successfully',
      },
    };
  },

  // -------------------------------------------------------------
  // GET TODOS BY DATE (Paginated + Filters)
  // -------------------------------------------------------------
  getTodosByDate: async (user, query) => {
    const { date, filter = 'my', page = 1, limit = 20 } = query;

    const isAdmin = user.role === 'admin';
    const userId = user.id;

    if (!date) {
      return {
        status: 400,
        error: 'Date is required',
      };
    }

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

    return {
      status: 200,
      data: {
        success: true,
        currentPage: p,
        totalPages: Math.ceil(count / l),
        totalTodos: count,
        todos,
      },
    };
  },

  // -------------------------------------------------------------
  // GET TODOS BY DATE RANGE (Month Summary)
  // -------------------------------------------------------------
  getTodosByDateRange: async (user, query) => {
    const { start, end, filter = 'my' } = query;
    const isAdmin = user.role === 'admin';
    const userId = user.id;

    if (!start || !end) {
      return {
        status: 400,
        error: 'Start and end dates required',
      };
    }

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

    return {
      status: 200,
      data: { success: true, taskSummary },
    };
  },

  // -------------------------------------------------------------
  // DASHBOARD DATA
  // -------------------------------------------------------------
  getDashboardData: async (user) => {
    const isAdmin = user.role === 'admin';
    const userId = user.id;

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

    return {
      status: 200,
      data: {
        success: true,
        overviewData,
        recentTodos,
      },
    };
  },
};
