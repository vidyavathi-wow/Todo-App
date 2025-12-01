const userListService = require('../services/usersService');

exports.listUsers = async (req, res) => {
  const result = await userListService.listUsers(req.user, req.query);

  return res.status(result.status).json(result.data);
};
