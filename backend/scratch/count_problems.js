const mongoose = require('mongoose');
const Problem = require('../src/models/problem');
require('dotenv').config({ path: 'c:/Users/amitk/OneDrive/Desktop/leecoAI/finalProject/backend/.env' });

async function checkProblems() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        const count = await Problem.countDocuments();
        console.log('Total problems in DB:', count);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkProblems();
