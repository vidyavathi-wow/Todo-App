require('dotenv').config();

// Remove trailing slash
const FRONTEND = process.env.FRONTEND_URL?.replace(/\/$/, '');

const allowedOrigins = [FRONTEND, 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
