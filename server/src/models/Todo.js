const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

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

    // Assigned user column
    assignedToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'todos',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletedAt',
  }
);

// Associations

// Task creator
Todo.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Todo, { foreignKey: 'userId', as: 'createdTodos' });

// User assigned to this task
Todo.belongsTo(User, { foreignKey: 'assignedToUserId', as: 'assignee' });
User.hasMany(Todo, { foreignKey: 'assignedToUserId', as: 'assignedTodos' });

module.exports = Todo;
