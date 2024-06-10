const connectDatabase = require('../db/redis');

function generateToken() {

  const redisClient = connectDatabase();
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