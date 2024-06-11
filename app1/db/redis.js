const { createClient } = require('redis');

const connectDatabase = () => {
    const client = createClient();

    client.on('connect', () => {
        console.log('Connected to Redis server');
    });

    client.on('error', (err) => {
        console.error('Error: ', err);
    });

    client.connect().catch(console.error);
    return client;
};
const redisClient = connectDatabase();

module.exports = redisClient;
