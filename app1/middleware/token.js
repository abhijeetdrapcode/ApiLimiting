require('dotenv').config();
const connectDatabase = require('../db/redis');
const redisClient = connectDatabase();

const generateToken = (req, res, next) => {
  const timestamp = Date.now().toString();
  let count = 0;

  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const tokenLength = 32;

    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }

    token = `${token}.${timestamp}`;

    res.cookie('token', token, { maxAge: 3600000 });

    redisClient.set(token, count, { EX: 60 * 20 }, (err, reply) => {
      if (err) {
        console.error('Error saving token to Redis:', err);
        return next(err);
      }
    });

    req.token = token;
    next();
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = generateToken;