const Discussion = require('../models/discussion');

const getDiscussions = async (req, res) => {
  try {
    const { problemId } = req.params;

    const discussions = await Discussion.find({ problemId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName profileImage')
      .limit(50);

    const formatted = discussions.map(d => ({
      _id: d._id,
      content: d.content,
      createdAt: d.createdAt,
      user: {
        _id: d.userId._id,
        firstName: d.userId.firstName,
        lastName: d.userId.lastName,
        profileImage: d.userId.profileImage,
      },
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Failed to fetch discussions' });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const discussion = await Discussion.create({
      problemId,
      userId,
      content: content.trim(),
    });

    const populated = await Discussion.findById(discussion._id)
      .populate('userId', 'firstName lastName profileImage');

    res.status(201).json({
      _id: populated._id,
      content: populated.content,
      createdAt: populated.createdAt,
      user: {
        _id: populated.userId._id,
        firstName: populated.userId.firstName,
        lastName: populated.userId.lastName,
        profileImage: populated.userId.profileImage,
      },
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Failed to post comment' });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.result._id;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the author or an admin can delete
    if (discussion.userId.toString() !== userId.toString() && req.result.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Discussion.findByIdAndDelete(id);
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

module.exports = { getDiscussions, createDiscussion, deleteDiscussion };
