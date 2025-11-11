const cron = require('node-cron');
const { Op } = require('sequelize');
const Todo = require('../models/Todo');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const logger = require('../utils/logger');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);

    const upcomingTodos = await Todo.findAll({
      where: {
        date: { [Op.between]: [now, reminderTime] },
        status: { [Op.ne]: 'completed' },
        reminded: { [Op.ne]: true },
      },
      include: { model: User, attributes: ['email', 'name'] },
    });

    for (const todo of upcomingTodos) {
      const user = todo.User;
      if (!user?.email) continue;

      const subject = `⏰ Reminder: ${todo.title} is due soon!`;
      const text = `Hi ${user.name || 'there'},\n\nYour task "${todo.title}" is due at ${todo.date.toLocaleString()}.\n\nCategory: ${todo.category}\nPriority: ${todo.priority}\n\nDon't forget to complete it!\n\n– To-Do App`;

      await sendEmail(user.email, subject, text);

      todo.reminded = true;
      await todo.save();

      logger.info(`Reminder email sent for todo "${todo.title}"`);
    }
  } catch (error) {
    logger.error('Reminder scheduler failed:', error);
  }
});
