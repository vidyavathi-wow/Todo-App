const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const User = require('./User');

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    token: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true,
  }
);

RefreshToken.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = RefreshToken;
