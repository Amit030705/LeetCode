const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const userMiddleware = async (req,res,next)=>{
    const { token } = req.cookies || {};
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_KEY);
    } catch {
        return res.status(401).json({ message: "Invalid or expired session" });
    }

    if (!payload?._id) {
        return res.status(401).json({ message: "Invalid session" });
    }

    try {
        const result = await User.findById(payload._id);
        if (!result) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (!redisClient.isReady) {
            return res.status(503).json({ message: "Authentication service is temporarily unavailable" });
        }

        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({ message: "Invalid session" });
        }

        req.result = result;
        return next();
    } catch (err) {
        console.error("Session validation failed:", err.message);
        return res.status(503).json({ message: "Authentication service is temporarily unavailable" });
    }
}


module.exports = userMiddleware;
