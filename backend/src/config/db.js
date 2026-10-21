const mongoose = require('mongoose');
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
    if (!process.env.DB_CONNECT_STRING) {
        throw new Error('DB_CONNECT_STRING is not configured');
    }

    await mongoose.connect(process.env.DB_CONNECT_STRING, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 10000,
    });
}

module.exports = main;
