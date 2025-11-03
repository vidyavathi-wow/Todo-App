module.exports = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You don't have permission.",
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};
