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
} = require('../middlewares/validators');
const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
