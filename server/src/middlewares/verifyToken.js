const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // 🔥 CRITICAL STEP: FORCE LOGOUT IF REFRESH TOKEN WAS REMOVED
    const activeRefresh = await RefreshToken.findOne({
      where: { userId: decoded.userId },
    });

    if (!activeRefresh) {
      return res.status(403).json({
        message: 'Session changed. Please login again.',
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Unauthorized.' });
  }
};

module.exports = verifyToken;
