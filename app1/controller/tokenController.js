
const jwt = require('jsonwebtoken');
const connectDatabase = require('../db/db'); 

const redisClient = connectDatabase();

const generateToken = async (req, res) => {
    const payload = { user: { id: 'abhijeetrana' } }; 
    const secret = process.env.JWT_SECRET || 'Abhijeet'; 
    const options = { expiresIn: '1h' };

    try {
        const token = jwt.sign(payload, secret, options);

        await redisClient.set(token, token, {EX: 60*60*1}, 3600);

        // res.cookie('token', token, {
        //     maxAge: 3600000, 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production', 
        //     sameSite: 'strict' 
        // });
        res.cookie('token', token, { maxAge: 3600000 });
        res.status(201).json({ token });
    } catch (err) {
        console.error('Error generating token:', err);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};

module.exports = generateToken;
