const userService = require('../services/userService');

// -----------------------------------------------------------
// LIST USERS (Paginated)
// -----------------------------------------------------------
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await userService.listUsers(
      req.user,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// -----------------------------------------------------------
// USER DASHBOARD DETAILS
// -----------------------------------------------------------
exports.getUserDashboardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.getUserDashboardDetails(id);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getUserDashboardDetails error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
