// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // your sequelize instance

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  refreshToken: {
  type: DataTypes.STRING,
  allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
