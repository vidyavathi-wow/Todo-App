require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const corsOptions = require('./config/cors');
const logger = require('./utils/logger.js');
const errorHandler = require('./middlewares/errorHandler.js');

const authRouter = require('./routes/authRouter.js');
const todosRouter = require('./routes/todoRouter.js');
const analyticsRouter = require('./routes/analyticsRouter');
const activityRouter = require('./routes/activityRouter.js');
const profileRouter = require('./routes/profileRouter.js');
const adminRouter = require('./routes/adminRouter.js');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API check' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/todos', todosRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/activitylogs', activityRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    logger.info('Database synced successfully');
    logger.info('✅ All models synchronized');

    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting/syncing database:', error);
    process.exit(1);
  });
