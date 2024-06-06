const crypto = require('crypto');
const connectDatabase = require('../db/db');

function generateToken(payload, secret) {
  if (!secret) {
    throw new Error('Secret is required to generate token');
  }

  const redisClient = connectDatabase();
  const timestamp = Date.now().toString();
  let count = 0;

  try {
    // console.log('Payload:', payload);
    // console.log('Secret:', secret);
    // console.log('Timestamp:', timestamp);

    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload) + timestamp).digest('hex');
    const token = `${hash}.${timestamp}`;

    redisClient.set(token, count, { EX: 60 * 20 }, (err, reply) => {
      if (err) {
        console.error('Error saving token to Redis:', err);
        throw new Error('Failed to save token');
      }
    });

    // console.log('Generated token:', token);
    return token;
  } catch (err) {
    console.error('Error generating token:', err);
    throw new Error('Failed to generate token');
  }
}
module.exports = generateToken;
