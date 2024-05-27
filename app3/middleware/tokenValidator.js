
const connectDatabase = require('../db/db');
const redisClient = connectDatabase();

const tokenValidator = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'No Auth token, authorization denied!' });
        }
        const storedToken = await redisClient.get(token);

        if (!storedToken) {
            return res.status(401).json({ msg: 'Invalid token, authorization denied!' });
        }
        next();
    } catch (err) {
        console.error('Error validating token:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = tokenValidator;
