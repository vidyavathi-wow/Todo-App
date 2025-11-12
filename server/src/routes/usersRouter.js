const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { listUsers } = require('../controllers/usersController');

router.get('/', verifyToken, listUsers);

module.exports = router;
