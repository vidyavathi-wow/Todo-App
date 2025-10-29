const axios = require('axios');
const logger = require('../utils/logger');
const sendEmail = async (to, subject, text) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY missing in environment');
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'To-Do App', email: process.env.SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        textContent: text,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Email sent:', response.data);
  } catch (error) {
    logger.error('Email failed:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
