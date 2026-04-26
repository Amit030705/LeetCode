const User = require('../models/user');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure cloudinary (assuming credentials are in environment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const userId = req.result._id;

    const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "leetcode-profiles", public_id: `user_${userId}` },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    const result = await streamUpload(req);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile image updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailId: updatedUser.emailId,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json([]);
    }

    const regex = new RegExp(q, 'i');
    
    // Search by firstName or lastName
    const users = await User.find({
      $or: [{ firstName: regex }, { lastName: regex }]
    })
    .select('_id firstName lastName profileImage role problemSolved')
    .limit(20);

    const results = users.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role,
      solvedCount: user.problemSolved ? user.problemSolved.length : 0
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('_id firstName lastName profileImage role problemSolved createdAt')
      .populate('problemSolved', 'title difficulty tags _id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all problems to calculate stats properly
    const allProblems = await Problem.find().select('_id');
    const totalProblems = allProblems.length;

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt
      },
      solvedProblems: user.problemSolved || [],
      totalProblems
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await Submission.find({
      userId: userId,
      status: 'accepted'
    }).select('createdAt');

    const activityData = {};
    submissions.forEach(sub => {
      const dateStr = sub.createdAt.toISOString().split('T')[0];
      if (activityData[dateStr]) {
        activityData[dateStr]++;
      } else {
        activityData[dateStr] = 1;
      }
    });

    res.status(200).json(activityData);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Failed to fetch activity data' });
  }
};

const getUserRanking = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all users with their problemSolved count, sorted descending
    const allUsers = await User.find({})
      .select('_id problemSolved')
      .lean();

    // Sort by solved count descending
    allUsers.sort((a, b) => {
      const aCount = a.problemSolved ? a.problemSolved.length : 0;
      const bCount = b.problemSolved ? b.problemSolved.length : 0;
      return bCount - aCount;
    });

    // Find the user's rank (1-indexed)
    const rank = allUsers.findIndex(u => u._id.toString() === userId) + 1;
    const totalUsers = allUsers.length;
    const userEntry = allUsers.find(u => u._id.toString() === userId);
    const solvedCount = userEntry?.problemSolved ? userEntry.problemSolved.length : 0;

    res.status(200).json({ rank: rank || totalUsers, totalUsers, solvedCount });
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    res.status(500).json({ message: 'Failed to fetch ranking' });
  }
};

module.exports = {
  uploadProfileImage,
  searchUsers,
  getPublicProfile,
  getUserActivity,
  getUserRanking
};
