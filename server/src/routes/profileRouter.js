const express = require('express');
const {
  getProfile,
  updateProfile,
} = require('../controllers/profileController');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', verifyToken, getProfile);
router.put('/', verifyToken, upload.single('profilePic'), updateProfile);

module.exports = router;
