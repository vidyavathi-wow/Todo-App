const express = require('express');
const passport = require('passport');
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  googleCallback,
} = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validatePassword,
  validateEmail,
} = require('../middlewares/validators');
require('../config/passportConfig');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/reset-password', validatePassword, resetPassword);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  googleCallback
);

module.exports = router;
