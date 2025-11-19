const express = require('express');
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
} = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validatePassword,
  validateEmail,
} = require('../middlewares/validators');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/reset-password', validatePassword, resetPassword);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// 🔥 Add this:
router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
