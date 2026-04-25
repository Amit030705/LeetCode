const { createClient } = require('redis');
require('dotenv').config({ path: 'c:/Users/amitk/OneDrive/Desktop/leecoAI/finalProject/backend/.env' });

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19934.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 19934
    }
});

async function checkRedis() {
    try {
        await redisClient.connect();
        console.log('Redis Connected Successfully');
        process.exit(0);
    } catch (err) {
        console.error('Redis Connection Error:', err.message);
        process.exit(1);
    }
}

checkRedis();
