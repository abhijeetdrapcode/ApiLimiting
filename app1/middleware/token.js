require('dotenv').config();
const redisClient = require('../db/redis');

const generateToken = (req, res, next) => {
  const timestamp = Date.now().toString();
  let projectID = "123"; 
  const uniqueSessionId = `unique_sessionid`;

  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const tokenLength = 32;

    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }
    token = `${token}.${timestamp}`;

    res.cookie('token', token, { maxAge: 1800000});
    
    const Data = { [projectID]: token };
    redisClient.set(uniqueSessionId, JSON.stringify(Data), { EX: 60 * 60 }, (err, reply) => {
      if (err) {
        console.error('Error saving session data to Redis:', err);
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