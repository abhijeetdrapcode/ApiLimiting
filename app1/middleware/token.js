const crypto = require('crypto');
const connectDatabase = require('../db/db');
const redisClient = connectDatabase();

const generateToken = (req, res, next) => {
  const payload = { user: { id: 'abhijeetrana' } };
  const secret = 'Abhijeet'; 
  const timestamp = Date.now().toString();
  let count = 0;

  try {
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload) + timestamp).digest('hex');
    const token = `${hash}.${timestamp}`;

    res.cookie('token', token, { maxAge: 3600000 }); 

    redisClient.set(token, count, { EX: 60 * 20 }, 3600, (err, reply) => {
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