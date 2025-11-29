const todoService = require('../services/todoService');

// CREATE
exports.createTodo = async (req, res) => {
  try {
    const todo = await todoService.createTodo(req.user, req.body);
    res.status(201).json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
exports.getAllTodos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await todoService.getAllTodos(req.user, page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET BY ID
exports.getTodo = async (req, res) => {
  try {
    const todo = await todoService.getTodoById(req.user, req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: 'Todo not found' });

    res.status(200).json({ success: true, todo });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE
exports.updateTodo = async (req, res) => {
  try {
    const todo = await todoService.updateTodo(
      req.user,
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, todo });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE STATUS
exports.updateTodoStatus = async (req, res) => {
  try {
    const todo = await todoService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, todo });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE
exports.deleteTodo = async (req, res) => {
  try {
    const message = await todoService.deleteTodo(req.user, req.params.id);
    res.status(200).json({ success: true, message });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// GET BY DATE
exports.getTodosByDate = async (req, res) => {
  try {
    const result = await todoService.getTodosByDate(req.user, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch todos by date' });
  }
};

// GET DATE RANGE SUMMARY
exports.getTodosByDateRange = async (req, res) => {
  try {
    const summary = await todoService.getTodosByDateRange(req.user, req.query);
    res.status(200).json({ success: true, taskSummary: summary });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DASHBOARD
exports.getDashboardData = async (req, res) => {
  try {
    const data = await todoService.getDashboardData(req.user);
    res.status(200).json({ success: true, ...data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
