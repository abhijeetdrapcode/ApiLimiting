const jwt = require('jsonwebtoken');
const connectDatabase = require('../db/db');
const redisClient = connectDatabase();

const generateToken = (req, res, next) => {
  const tokenFromCookie = req.cookies.token;

  if (tokenFromCookie) {
    req.token = tokenFromCookie;
    return next();
  }
  const payload = { user: { id: 'abhijeetrana' } };
  const secret = 'Abhijeet';
  const options = { expiresIn: '1h' };

  try {
    const token = jwt.sign(payload, secret, options);
    res.cookie('token', token, { maxAge: 3600000 });

    redisClient.set(token, token, {EX: 60*60*1}, 3600, (err, reply) => {
      if (err) {
        console.error('Error saving token to Redis:', err);
        return next(err);
      }
      console.log(`Token saved to Redis: ${reply}`);
    });

    req.token = token; 
    next(); 
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = generateToken;