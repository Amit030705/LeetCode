const cloudinary = require('cloudinary').v2;
const Problem = require('../models/problem');
const SolutionVideo = require('../models/solutionVideo');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig = () => [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every(Boolean);

const generateUploadSignature = async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(503).json({ error: 'Video storage is not configured on the server' });
    }

    const { problemId } = req.params;
    const problem = await Problem.findById(problemId).select('_id');
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${req.result._id}_${timestamp}`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, public_id: publicId }, process.env.CLOUDINARY_API_SECRET);

    return res.status(200).json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });
  } catch (error) {
    console.error('Error generating video upload signature:', error.message);
    return res.status(500).json({ error: 'Could not prepare the video upload' });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const { problemId, cloudinaryPublicId } = req.body;
    if (!problemId || !cloudinaryPublicId) {
      return res.status(400).json({ error: 'Problem and uploaded video IDs are required' });
    }
    if (!hasCloudinaryConfig()) {
      return res.status(503).json({ error: 'Video storage is not configured on the server' });
    }

    const problem = await Problem.findById(problemId).select('_id');
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const existing = await SolutionVideo.findOne({ problemId });
    if (existing) return res.status(409).json({ error: 'A video is already attached to this problem' });

    const resource = await cloudinary.api.resource(cloudinaryPublicId, { resource_type: 'video' });
    if (!resource?.secure_url) return res.status(400).json({ error: 'Uploaded video was not found in storage' });

    const video = await SolutionVideo.create({
      problemId,
      userId: req.result._id,
      cloudinaryPublicId: resource.public_id,
      secureUrl: resource.secure_url,
      duration: Number(resource.duration) || Number(req.body.duration) || 0,
      thumbnailUrl: cloudinary.url(resource.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ width: 400, height: 225, crop: 'fill' }, { quality: 'auto' }],
      }),
    });

    return res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: video._id,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        uploadedAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving video metadata:', error.message);
    return res.status(502).json({ error: 'Could not verify and save the uploaded video' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const videos = await SolutionVideo.find({ problemId: req.params.problemId });
    if (videos.length === 0) return res.status(404).json({ error: 'Video not found' });
    if (!hasCloudinaryConfig()) {
      return res.status(503).json({ error: 'Video storage is not configured on the server' });
    }

    for (const video of videos) {
      const result = await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
        resource_type: 'video',
        invalidate: true,
      });
      if (result.result !== 'ok' && result.result !== 'not found') {
        return res.status(502).json({ error: 'Cloudinary could not delete the video; its record was kept' });
      }
    }

    await SolutionVideo.deleteMany({ problemId: req.params.problemId });
    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error.message);
    return res.status(502).json({ error: 'Could not delete the video from storage' });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await SolutionVideo.find({})
      .select('problemId secureUrl duration cloudinaryPublicId createdAt')
      .sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    return res.status(500).json({ error: 'Could not load videos' });
  }
};

module.exports = { generateUploadSignature, saveVideoMetadata, deleteVideo, getAllVideos };
