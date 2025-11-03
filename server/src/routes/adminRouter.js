const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyRole = require('../middlewares/verifyRole');

router.get('/', verifyToken, verifyRole('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome, Admin!' });
});

module.exports = router;
