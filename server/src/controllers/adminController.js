const adminService = require('../services/adminService');

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllUsers(page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// USER DASHBOARD DETAILS
exports.getUserDashboardDetails = async (req, res) => {
  try {
    const result = await adminService.getUserDashboardDetails(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ACTIVITY LOGS
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getActivityLogs(page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE USER
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const message = await adminService.deleteUserByAdmin(
      req.user,
      req.params.id
    );
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// RESTORE USER
exports.restoreUserByAdmin = async (req, res) => {
  try {
    const message = await adminService.restoreUserByAdmin(
      req.user,
      req.params.id
    );
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PROMOTE USER
exports.promoteUserByAdmin = async (req, res) => {
  try {
    const message = await adminService.promoteUserByAdmin(
      req.user,
      req.params.id
    );
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DEMOTE USER
exports.demoteUserByAdmin = async (req, res) => {
  try {
    const message = await adminService.demoteUserByAdmin(
      req.user,
      req.params.id
    );
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
