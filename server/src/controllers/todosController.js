const sequelize = require("../config/db");
const Todo = require("../models/Todo");
const logger = require("../utils/logger");

exports.createTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, status, date, category, priority, notes } = req.body;
    const userId = req.user.id;
    const todo = await Todo.create({ title, description, status, date, category, priority, notes, userId }, { transaction: t });
    await t.commit();
    logger.info(`Todo created by user ${userId}: ${title}`);
    res.status(201).json({ success: true, message: "Todo created", todo });
  } catch (error) {
    await t.rollback();
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.findAll({ where: { userId }, order: [["createdAt", "DESC"]] });
    logger.info(`Fetched todos for user ${userId}`);
    res.status(200).json({ success: true, todos });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const todo = await Todo.findOne({ where: { id, userId } });
    if (!todo) return res.status(404).json({ success: false, message: "Todo not found" });
    logger.info(`Todo fetched: ${id}`);
    res.status(200).json({ success: true, todo });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, category, priority, notes, status } = req.body;
    const todo = await Todo.findOne({ where: { id, userId }, transaction: t });
    if (!todo) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Todo not found" });
    }
    await todo.update({ title, description, date, category, priority, notes, status }, { transaction: t });
    await t.commit();
    logger.info(`Todo updated: ${id}`);
    res.status(200).json({ success: true, message: "Todo updated", todo });
  } catch (error) {
    await t.rollback();
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(404).json({ success: false, message: "Todo not found" });
    }
    await todo.destroy({ transaction: t });
    await t.commit();
    logger.info(`Todo deleted: ${id}`);
    res.json({ success: true, message: "Todo deleted" });
  } catch (error) {
    await t.rollback();
    logger.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const [completedCount, inProgressCount, pendingCount] = await Promise.all([
      Todo.count({ where: { userId, status: "completed" } }),
      Todo.count({ where: { userId, status: "inProgress" } }),
      Todo.count({ where: { userId, status: "pending" } }),
    ]);
    const recentTodos = await Todo.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    logger.info(`Dashboard data fetched for user ${userId}`);
    res.status(200).json({
      success: true,
      overviewData: {
        completed: completedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        recentTodos,
      },
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
