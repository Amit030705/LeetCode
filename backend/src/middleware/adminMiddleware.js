const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (!payload?._id) return res.status(401).json({ message: 'Invalid session' });

  try {
    const user = await User.findById(payload._id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    if (user.role !== 'admin' || payload.role !== 'admin') {
      return res.status(403).json({ message: 'Administrator access required' });
    }
    // Redis stores revoked tokens only. Keep session validation available
    // during a Redis outage; the signed JWT still expires after one hour.
    if (redisClient.isReady) {
      try {
        if (await redisClient.exists(`token:${token}`)) {
          return res.status(401).json({ message: 'Invalid session' });
        }
      } catch (redisError) {
        console.error('Token revocation check unavailable:', redisError.message);
      }
    }

    req.result = user;
    return next();
  } catch (error) {
    console.error('Admin session validation failed:', error.message);
    return res.status(503).json({ message: 'Authentication service is temporarily unavailable' });
  }
};

module.exports = adminMiddleware;
