const sequelize = require('../config/db.js');
const { DataTypes } = require('sequelize');

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    profilePic: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  },
  {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // ✅ Enables soft delete
    deletedAt: 'deletedAt', // Column name
  }
);

module.exports = User;
