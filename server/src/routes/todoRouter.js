const express = require('express');
const router = express.Router();
const {
  createTodo,
  getTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  getDashboardData
} = require('../controllers/todosController');

const verifyToken = require('../middlewares/verifyToken');
const {
  validateTodo,
  validateTodoIdParam
} = require('../middlewares/validators');

router.post('/', verifyToken, validateTodo, createTodo);

router.get('/:id', verifyToken, validateTodoIdParam, getTodo);

router.get("/data/dashboard",verifyToken,getDashboardData);

router.get('/', verifyToken, getAllTodos);

router.put('/:id', verifyToken, validateTodoIdParam, validateTodo, updateTodo);


router.delete('/:id', verifyToken, validateTodoIdParam, deleteTodo);

module.exports = router;
