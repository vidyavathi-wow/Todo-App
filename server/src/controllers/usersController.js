const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    const users = await User.findAll({
      attributes: isAdmin
        ? ['id', 'name', 'email'] // Admin sees email
        : ['id', 'name'], // Non-admin sees only name
      order: [['name', 'ASC']],
      paranoid: true,
    });

    res.status(200).json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
