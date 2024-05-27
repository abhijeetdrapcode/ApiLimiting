// const connectDatabase = require('../db/db');
// const redisClient = connectDatabase();
// const cookieParser = require('cookie-parser');


// const validateToken = async (req, res, next) => {
//   let token = req.cookies.token; 

//   if (!token) {
//     token = req.body.token; 
//   }

//   if (!token) {
//     return res.status(401).json({ error: "No Token Provided" });
//   }

//   try {
//     console.log(`Received Token for validation: ${token}`);

//     const storedToken = await redisClient.get(token);
//     console.log("Testing");

//     if (!storedToken) {
//       console.log(`Token not found: ${token}`);
//       return res.status(401).json({ error: "Invalid Token" });
//     }

//     console.log(`Token is valid: ${token}`);
//     return next();
//   } catch (error) {
//     console.error('Error validating token:', error);
//     res.status(500).json({ error: 'Token validation failed' });
//   }
// };

// module.exports = validateToken;
console.log("This is just for testing");