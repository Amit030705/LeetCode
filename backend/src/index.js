const express = require('express')
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const userProfileRouter = require("./routes/userProfile");
const discussionRouter = require("./routes/discussion");
const cors = require('cors')

// console.log("Hello")

app.set('trust proxy', 1);

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'https://leetcode-3-5uak.onrender.com', // Added explicit fallback
            'http://localhost:5173',
            'http://localhost:5174'
        ].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slashes

        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
            callback(null, true);
        } else {
            console.error("CORS blocked for origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use("/users", userProfileRouter);
app.use("/discussion", discussionRouter);

console.log("Routes registered: /user, /problem, /submission, /ai, /video, /users, /discussion");

app.get('/health', (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    const redisReady = redisClient.isReady;
    const healthy = databaseReady && redisReady;

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        database: databaseReady ? 'ready' : 'unavailable',
        redis: redisReady ? 'ready' : 'unavailable',
    });
});


const initializeConnections = async () => {
    try{
        await main();
        console.log("MongoDB connected");

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server listening at port number: ${port}`);
        })

        // Redis is used for token revocation. Don't keep the HTTP server from
        // starting if Redis is temporarily unavailable; its client retries.
        redisClient.connect().catch((err) => {
            console.error("Redis connection unavailable; retrying in background:", err.message);
        });
    }
    catch(err){
        console.error("MongoDB connection failed; API server was not started:", err.message);
    }
}


initializeConnections();
