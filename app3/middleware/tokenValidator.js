const connectDatabase = require('../db/redisdb');
const redisClient = connectDatabase();
const generateToken = require('./tokenGenerator');

const tokenValidator = async (req, res, next) => {
  const projectID = "123";

  try {
    if (!projectID) {
      return res.status(401).json({ msg: 'No ProjectID, authorization denied!' });
    }

    const token = req.header('x-auth-token');
    console.log("token ",token);
    if (!token) {
      return res.status(401).json({ msg: 'No Auth token, authorization denied!' });
    }

    const uniqueSessionId = `unique_sessionid`;
    const Data = await redisClient.get(uniqueSessionId);

    if (!Data) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const parsedSessionData = JSON.parse(Data);
    const RedisToken = parsedSessionData[projectID];

    if (token !== RedisToken) {
      return res.status(403).json({ msg: 'Access denied.' });
    }
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    const newToken = generateToken();
    console.log("newToken: ",newToken);
    res.header('Access-Control-Expose-Headers','auth_token');
    res.header('auth_token', newToken);
    
    // res.cookie('token', newToken, { maxAge: 3600000, path: '/' });
    // res.cookie('auth_token', newToken, { httpOnly: true, secure: true });
    // res.cookie('token', newToken);
    next();
  } catch (err) {
    console.error('Error validating token:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = tokenValidator;