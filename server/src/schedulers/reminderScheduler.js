const cron = require('node-cron');
const { Op } = require('sequelize');
const Todo = require('../models/Todo');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const logger = require('../utils/logger');

// Run every minute to check upcoming reminders
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes ahead

    // Fetch todos due within the next 10 minutes
    const upcomingTodos = await Todo.findAll({
      where: {
        date: { [Op.between]: [now, reminderTime] },
        status: { [Op.ne]: 'completed' },
        reminded: { [Op.ne]: true },
      },
      include: [
        {
          model: User,
          as: 'assignee', // 👈 Use alias from Todo model association
          attributes: ['email', 'name'],
        },
      ],
    });

    for (const todo of upcomingTodos) {
      const user = todo.assignee; // 👈 assigned user
      if (!user?.email) continue;

      const subject = `⏰ Reminder: ${todo.title} is due soon!`;
      const text = `
Hi ${user.name || 'there'},

Your assigned task "${todo.title}" is due at ${todo.date.toLocaleString()}.

Category: ${todo.category}
Priority: ${todo.priority}

Don't forget to complete it!

– To-Do App
`;

      // Send email
      await sendEmail(user.email, subject, text);

      // Mark todo as reminded to avoid duplicate notifications
      todo.reminded = true;
      await todo.save();

      logger.info(
        `Reminder email sent for todo "${todo.title}" to ${user.email}`
      );
    }
  } catch (error) {
    logger.error('Reminder scheduler failed:', error);
  }
});
