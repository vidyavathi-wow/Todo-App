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
    description: DataTypes.TEXT,
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
    notes: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('inProgress', 'pending', 'completed'),
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'todos',
    timestamps: true,
    paranoid: true, // ✅ Soft delete
    deletedAt: 'deletedAt',
  }
);

User.hasMany(Todo, { foreignKey: 'userId', onDelete: 'CASCADE' });
Todo.belongsTo(User, { foreignKey: 'userId' });

module.exports = Todo;
