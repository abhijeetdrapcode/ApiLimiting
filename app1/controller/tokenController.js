// const crypto = require('crypto');
// const connectDatabase = require('../db/db');
// const redisClient = connectDatabase();

// const generateToken = async (req, res) => {
//   const payload = { user: { id: 'abhijeetrana' } };
//   const secret = 'Abhijeet'; 
//   const timestamp = Date.now().toString();
//   const count = 0;

//   try {
//     const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload) + timestamp).digest('hex');
//     const token = `${hash}.${timestamp}`;

//     await redisClient.set(token, count, { EX: 60 * 20 }); // for testing, i had set this to 20 minutes
//     // console.log("Token saved: ",token);
//     res.cookie('token', token, { maxAge: 3600000 }); 

//     res.status(201).json({ token });
//   } catch (err) {
//     console.error('Error generating token:', err);
//     res.status(500).json({ error: 'Failed to generate token' });
//   }
// };

// module.exports = generateToken;