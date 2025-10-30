const express = require('express');
const {
  login,
  register,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validatePassword,
  validateEmail,
} = require('../middlewares/validators');
const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/reset-password', validatePassword, resetPassword);

module.exports = router;
