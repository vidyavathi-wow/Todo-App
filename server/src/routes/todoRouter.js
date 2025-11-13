const express = require('express');
const router = express.Router();
const {
  createTodo,
  getTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  getDashboardData,
  updateTodoStatus,
  getTodosByDate,
  getTodosByDateRange,
} = require('../controllers/todosController');

const verifyToken = require('../middlewares/verifyToken');
const {
  validateTodo,
  validateTodoIdParam,
} = require('../middlewares/validators');

router.post('/', verifyToken, validateTodo, createTodo);

router.get('/', verifyToken, getAllTodos);

router.get('/data/dashboard', verifyToken, getDashboardData);

router.get('/by-date', verifyToken, getTodosByDate);

router.get('/by-date-range', verifyToken, getTodosByDateRange);

router.get('/:id', verifyToken, validateTodoIdParam, getTodo);

router.put('/:id', verifyToken, validateTodoIdParam, validateTodo, updateTodo);

router.delete('/:id', verifyToken, validateTodoIdParam, deleteTodo);

router.patch('/:id/status', verifyToken, validateTodoIdParam, updateTodoStatus);

module.exports = router;
