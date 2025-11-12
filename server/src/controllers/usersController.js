const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
      paranoid: true,
    });
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
