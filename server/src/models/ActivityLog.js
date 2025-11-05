const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const ActivityLog = sequelize.define(
  'ActivityLog',
  {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'activity_logs',
    timestamps: false,
    paranoid: true,
    deletedAt: 'deletedAt',
  }
);

User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = ActivityLog;
