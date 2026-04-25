const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14747.c232.us-east-1-2.ec2.cloud.redislabs.com',
        port: 14747
    }
});

module.exports = redisClient;