const jwt = require('jsonwebtoken');
const connectDatabase = require('../db/db'); 

const redisClient = connectDatabase();

const generateToken = async (req, res) => {
    const payload = { user: { id: 'abhijeetrana' } }; 
    const secret =  'Abhijeet'; 
    const options = { expiresIn: '1h' };

    try {
        const token = jwt.sign(payload, secret, options);

        await redisClient.set(token, token, {EX: 60*2}, 3600); // for testing, i had set this to 2 minutes

        res.cookie('token', token, { maxAge: 3600000 });
        res.status(201).json({ token });
    } catch (err) {
        console.error('Error generating token:', err);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};

module.exports = generateToken;
