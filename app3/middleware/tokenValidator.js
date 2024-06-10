const connectDatabase = require('../db/redisdb');
const redisClient = connectDatabase();

const tokenValidator = async (req, res, next) => {
  const projectID = "123";

  try {
    if (!projectID) {
      return res.status(401).json({ msg: 'No ProjectID, authorization denied!' });
    }

    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No Auth token, authorization denied!' });
    }

    const uniqueSessionId = `unique_sessionid`;
    const sessionData = await redisClient.get(uniqueSessionId);

    if (!sessionData) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const parsedSessionData = JSON.parse(sessionData);
    const RedisToken = parsedSessionData[projectID];

    if (token !== RedisToken) {
      return res.status(403).json({ msg: 'Access denied.' });
    }


    next();
  } catch (err) {
    console.error('Error validating token:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = tokenValidator;