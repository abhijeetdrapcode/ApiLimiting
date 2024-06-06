const express = require('express');
const router = express.Router();

router.get('/test1', (req, res) => {
    res.json({ message: 'This endpoint is for checking the authorization ,Endpoint 1' });
});

router.get('/test2', (req, res) => {
    res.send({ message: 'Endpoint 2 is working fine !' });
});

module.exports = router;
