const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/amitk/OneDrive/Desktop/leecoAI/finalProject/backend/.env' });

async function checkConnection() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log('MongoDB Connected Successfully');
        process.exit(0);
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
}

checkConnection();
