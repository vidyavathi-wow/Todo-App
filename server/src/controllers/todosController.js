const logger = require('../utils/logger');
const todoService = require('../services/todosService');

// CREATE TODO
exports.createTodo = async (req, res) => {
  try {
    const result = await todoService.createTodo(req.user, req.body);
    return res.status(result.status).json(result.data);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL TODOS (paginated)
exports.getAllTodos = async (req, res) => {
  try {
    const result = await todoService.getAllTodos(req.user, req.query);
    return res.status(result.status).json(result.data);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET TODO BY ID
exports.getTodo = async (req, res) => {
  try {
    const result = await todoService.getTodo(req.user, req.params.id);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE TODO
exports.updateTodo = async (req, res) => {
  try {
    const result = await todoService.updateTodo(
      req.user,
      req.params.id,
      req.body
    );

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE TODO STATUS
exports.updateTodoStatus = async (req, res) => {
  try {
    const result = await todoService.updateTodoStatus(req.params.id, req.body);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    // original used res.json(...) (status 200)
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE TODO
exports.deleteTodo = async (req, res) => {
  try {
    const result = await todoService.deleteTodo(req.user, req.params.id);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET TODOS BY DATE
exports.getTodosByDate = async (req, res) => {
  try {
    const result = await todoService.getTodosByDate(req.user, req.query);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    logger.error('getTodosByDate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch todos by date',
    });
  }
};

// GET TODOS BY DATE RANGE
exports.getTodosByDateRange = async (req, res) => {
  try {
    const result = await todoService.getTodosByDateRange(req.user, req.query);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DASHBOARD DATA
exports.getDashboardData = async (req, res) => {
  try {
    const result = await todoService.getDashboardData(req.user);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
