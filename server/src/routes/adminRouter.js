const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyRole = require('../middlewares/verifyRole');

const {
  getAllUsers,
  getUserDashboardDetails,
  getActivityLogs,
  deleteUserByAdmin,
  restoreUserByAdmin,
  promoteUserByAdmin,
  demoteUserByAdmin,
} = require('../controllers/adminController');

router.get('/', verifyToken, verifyRole('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome, Admin!' });
});

router.get('/users', verifyToken, verifyRole('admin'), getAllUsers);

// NEW - fetch full user details for admin drawer
router.get(
  '/users/:id/details',
  verifyToken,
  verifyRole('admin'),
  getUserDashboardDetails
);

// Promote → Admin
router.put(
  '/users/:id/promote',
  verifyToken,
  verifyRole('admin'),
  promoteUserByAdmin
);

router.put(
  '/users/:id/demote',
  verifyToken,
  verifyRole('admin'),
  demoteUserByAdmin
);

router.delete(
  '/users/:id',
  verifyToken,
  verifyRole('admin'),
  deleteUserByAdmin
);

// Restore soft deleted user

router.patch(
  '/users/:id/restore',
  verifyToken,
  verifyRole('admin'),
  restoreUserByAdmin
);

router.get('/activitylogs', verifyToken, verifyRole('admin'), getActivityLogs);

module.exports = router;
