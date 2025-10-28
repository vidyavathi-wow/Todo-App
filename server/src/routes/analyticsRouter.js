const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, getAnalytics);

module.exports = router;
