const express = require('express');
const router = express.Router();
const multer = require('multer');
const userMiddleware = require('../middleware/userMiddleware');
const { uploadProfileImage, searchUsers, getPublicProfile, getUserActivity, getUserRanking } = require('../controllers/userProfile');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload-image', userMiddleware, upload.single('image'), uploadProfileImage);
router.get('/search', userMiddleware, searchUsers);
router.get('/:userId/activity', userMiddleware, getUserActivity);
router.get('/:userId/ranking', userMiddleware, getUserRanking);
router.get('/:userId', userMiddleware, getPublicProfile);

module.exports = router;
