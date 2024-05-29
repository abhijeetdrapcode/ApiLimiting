const connectDatabase = require('../db/db');
const redisClient = connectDatabase();
const axios = require('axios');

const tokenValidator = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No Auth token, authorization denied!' });
    }
    const tokenCount = await redisClient.get(token);
    if (!tokenCount) {
      return res.status(401).json({ msg: 'Invalid token, authorization denied!' });
    }
    const count = parseInt(tokenCount, 10);
    if (count >= 5) {
      await redisClient.del(token);
      return res.status(403).json({ msg: 'Access denied. Maximum API calls reached.' });
    }

    await redisClient.set(token, count + 1);
    next();
  } catch (err) {
    console.error('Error validating token:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = tokenValidator;