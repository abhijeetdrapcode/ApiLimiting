const jwt = require('jsonwebtoken');
const connectDatabase = require('../db/db');
const redisClient = connectDatabase();

const generateToken = (req, res, next) => {
  const tokenFromCookie = req.cookies.token;

  if (tokenFromCookie) {
    // Token is already present in the client's cookies, no need to generate a new one
    req.token = tokenFromCookie;
    return next();
  }

  const payload = { user: { id: 'abhijeetrana' } };
  const secret = process.env.JWT_SECRET || 'Abhijeet';
  const options = { expiresIn: '1h' };

  try {
    const token = jwt.sign(payload, secret, options);

    // Set the cookie with the generated token
    res.cookie('token', token, { maxAge: 3600000 });

    // Save the token in Redis
    redisClient.set(token, token, {EX: 60*60*1}, 3600, (err, reply) => {
      if (err) {
        console.error('Error saving token to Redis:', err);
        return next(err);
      }
      console.log(`Token saved to Redis: ${reply}`);
    });

    req.token = token; // Store the token in the request object
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = generateToken;