const { createClient }  = require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12161.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
        port: 12161,
        connectTimeout: 10000,
        reconnectStrategy: (retries) => Math.min(retries * 1000, 10000),
    }
});

redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message);
});

redisClient.on('ready', () => {
    console.log('Redis connected and ready');
});

redisClient.on('reconnecting', () => {
    console.warn('Redis reconnecting');
});

module.exports = redisClient;


