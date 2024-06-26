const redisClient = require('../db/redisdb');

function generateToken() {
  const timestamp = Date.now().toString();
  const projectID = "123";
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

    const Data = { [projectID]: token };

    redisClient.set(uniqueSessionId, JSON.stringify(Data), { EX: 60 * 60 }, (err, reply) => {
      if (err) {
        console.error('Error saving session data to Redis:', err);
        throw new Error('Failed to save token');
      }
    });

    return token;
  } catch (err) {
    console.error('Error generating token:', err);
    throw new Error('Failed to generate token');
  }
}

module.exports = generateToken;