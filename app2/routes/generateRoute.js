const express = require('express');
const router = express.Router();
const generateTokenFromApp1 = require('../controllers/generateToken');

router.get('/generate-token',generateTokenFromApp1);

module.exports = router;