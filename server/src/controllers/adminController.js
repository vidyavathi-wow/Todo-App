const adminService = require('../services/adminService');

exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const { count, rows: users } = await adminService.getAllUsers({
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalUsers: count,
      users,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserDashboardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getUserDashboardDetails({ id });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: result.user,
      stats: {
        todosCount: result.todosCount,
        deleted: !!result.user.deletedAt,
        isActive: !result.user.deletedAt,
      },
      logs: result.logs,
    });
  } catch (err) {
    console.error('getUserDashboardDetails error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error fetching user details' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const { count, rows: logs } = await adminService.getActivityLogs({
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalLogs: count,
      logs,
    });
  } catch (error) {
    console.error('getActivityLogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteUserByAdmin({
      admin: req.user,
      id,
    });

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error('deleteUserByAdmin error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.restoreUserByAdmin({
      admin: req.user,
      id,
    });

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('restoreUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.promoteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.promoteUserByAdmin({
      admin: req.user,
      id,
    });

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('promoteUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.demoteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.demoteUserByAdmin({
      admin: req.user,
      id,
    });

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('demoteUserByAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
