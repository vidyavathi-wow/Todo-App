// models/ActivityLog.js
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
      type: DataTypes.DATE, // includes both date and time
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'activity_logs',
    timestamps: false,
  }
);

User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = ActivityLog;
