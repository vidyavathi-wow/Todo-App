const cron = require('node-cron');
const { Op } = require('sequelize');
const Todo = require('../models/Todo');
const User = require('../models/User');
const sendEmail = require('../config/emailServeice');
const logger = require('../utils/logger');

let running = false;
const LIMIT = 200;

cron.schedule('* * * * *', async () => {
  if (running) {
    logger.warn(
      'Reminder job skipped because previous run is still in progress.'
    );
    return;
  }

  running = true;
  logger.info('Reminder job started');

  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);

    const upcomingTodos = await Todo.findAll({
      where: {
        date: { [Op.between]: [now, reminderTime] },
        status: { [Op.ne]: 'completed' },
        reminded: { [Op.ne]: true },
      },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'email', 'name'],
        },
      ],
      limit: LIMIT,
      order: [['date', 'ASC']],
    });

    if (!upcomingTodos.length) {
      running = false;
      logger.info('No upcoming todos to remind.');
      return;
    }

    const todoIds = upcomingTodos.map((t) => t.id);

    await Todo.update(
      { reminded: true },
      { where: { id: { [Op.in]: todoIds } } }
    );

    logger.info(`Queued ${todoIds.length} reminders`);

    upcomingTodos.forEach((todo) => {
      setImmediate(async () => {
        try {
          const user = todo.assignee;
          if (!user?.email) {
            await Todo.update({ reminded: false }, { where: { id: todo.id } });
            return;
          }

          // Format date directly without re-parsing
          const formattedDate = new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          }).format(new Date(todo.date));

          const subject = `⏰ Reminder: ${todo.title} is due soon!`;
          const text = `
Hi ${user.name || 'there'},

Your assigned task "${todo.title}" is due at ${formattedDate}.

Category: ${todo.category}
Priority: ${todo.priority}

– To-Do App
`;

          await sendEmail(user.email, subject, text);
          logger.info(
            `Reminder email sent for "${todo.title}" to ${user.email}`
          );
        } catch (err) {
          logger.error(`Failed to send reminder for ${todo.id}:`, err);
          try {
            await Todo.update({ reminded: false }, { where: { id: todo.id } });
          } catch (dbErr) {
            logger.error(
              `Failed to revert reminded flag for ${todo.id}:`,
              dbErr
            );
          }
        }
      });
    });
  } catch (error) {
    logger.error('Reminder scheduler failed:', error);
  } finally {
    setTimeout(() => {
      running = false;
      logger.info('Reminder job finished');
    }, 50);
  }
});
