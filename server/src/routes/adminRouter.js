const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyRole = require('../middlewares/verifyRole');
const {
  getAllUsers,
  getActivityLogs,
  deleteUserByAdmin,
  restoreUserByAdmin,
} = require('../controllers/adminController');

router.get('/', verifyToken, verifyRole('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome, Admin!' });
});

router.get('/users', verifyToken, verifyRole('admin'), getAllUsers);

router.get('/activitylogs', verifyToken, verifyRole('admin'), getActivityLogs);

router.delete(
  '/users/:id',
  verifyToken,
  verifyRole('admin'),
  deleteUserByAdmin
);
router.get('/users/:id', verifyToken, verifyRole('admin'), restoreUserByAdmin);

module.exports = router;
