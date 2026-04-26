const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getDiscussions, createDiscussion, deleteDiscussion } = require('../controllers/discussion');

router.get('/:problemId', userMiddleware, getDiscussions);
router.post('/:problemId', userMiddleware, createDiscussion);
router.delete('/comment/:id', userMiddleware, deleteDiscussion);

module.exports = router;
