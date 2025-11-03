const express = require('express');
const { getActivityLogs } = require('../controllers/activityController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.get('/', verifyToken, getActivityLogs);

module.exports = router;
