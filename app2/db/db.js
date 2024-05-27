const { createClient } = require('redis');

const connectDatabase = () => {
    // Create a Redis client
    const client = createClient();

    // Connect to Redis server
    client.on('connect', () => {
        console.log('Connected to Redis server');
    });

    // Handle errors
    client.on('error', (err) => {
        console.error('Error: ', err);
    });

    // Connect to the Redis server
    client.connect().catch(console.error);

    // Return the Redis client
    return client;
};

module.exports = connectDatabase;
