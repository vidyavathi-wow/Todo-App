const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../models/User');

const Todo = sequelize.define(
  'Todo',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Work', 'Personal', 'Other'),
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Moderate', 'High'),
      defaultValue: 'Moderate',
    },
    notes: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('inProgress', 'pending', 'completed'),
      defaultValue: 'pending',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'todos',
    timestamps: true,
  }
);

User.hasMany(Todo, { foreignKey: 'userId', onDelete: 'CASCADE' });
Todo.belongsTo(User, { foreignKey: 'userId' });

module.exports = Todo;
