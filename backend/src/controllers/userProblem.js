const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const SolutionVideo = require('../models/solutionVideo');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const validateProblem = (payload) => {
  for (const field of ['title', 'description', 'difficulty', 'tags']) {
    if (typeof payload[field] !== 'string' || !payload[field].trim()) {
      throw new Error(`${field} is required`);
    }
  }

  const visible = payload.visibleTestCases;
  const hidden = payload.hiddenTestCases;
  const starter = payload.startCode;
  const references = payload.referenceSolution ?? [];
  if (!Array.isArray(visible) || visible.length === 0) throw new Error('Add at least one visible test case');
  if (!Array.isArray(hidden) || hidden.length === 0) throw new Error('Add at least one hidden test case before publishing');
  if (!Array.isArray(starter) || starter.length === 0) throw new Error('Add starter code for at least one language');
  if (!Array.isArray(references)) throw new Error('referenceSolution must be an array');

  for (const [index, testCase] of visible.entries()) {
    if (typeof testCase.input !== 'string' || typeof testCase.output !== 'string' || !testCase.output.trim()) {
      throw new Error(`Visible test case ${index + 1} needs both input and expected output`);
    }
  }
  for (const [index, testCase] of hidden.entries()) {
    if (typeof testCase.input !== 'string' || typeof testCase.output !== 'string' || !testCase.output.trim()) {
      throw new Error(`Hidden test case ${index + 1} needs both input and expected output`);
    }
  }

  return references;
};

const verifyReferenceSolutions = async (solutions, visibleTestCases) => {
  for (const solution of solutions) {
    const languageId = getLanguageById(solution.language);
    if (!languageId) throw new Error(`Unsupported reference solution language: ${solution.language}`);
    if (!solution.completeCode?.trim()) throw new Error(`Reference solution for ${solution.language} is empty`);

    const submissions = visibleTestCases.map((testCase) => ({
      source_code: solution.completeCode,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));
    const tokens = (await submitBatch(submissions)).map(({ token }) => token);
    const results = await submitToken(tokens);
    const failedResult = results.find((result) => result.status_id !== 3);
    if (failedResult) {
      const reason = failedResult.status?.description || failedResult.stderr || 'expected output did not match';
      throw new Error(`Reference solution failed in ${solution.language}: ${reason}`);
    }
  }
};

const createProblem = async (req, res) => {
  try {
    const referenceSolutions = validateProblem(req.body);
    await verifyReferenceSolutions(referenceSolutions, req.body.visibleTestCases);
    const problem = await Problem.create({ ...req.body, problemCreator: req.result._id });
    return res.status(201).json({ message: 'Problem saved successfully', problem });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Problem could not be created' });
  }
};

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Problem ID is required' });

    const existingProblem = await Problem.findById(id);
    if (!existingProblem) return res.status(404).json({ message: 'Problem not found' });

    const referenceSolutions = validateProblem(req.body);
    await verifyReferenceSolutions(referenceSolutions, req.body.visibleTestCases);
    const problem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body, problemCreator: existingProblem.problemCreator },
      { runValidators: true, new: true }
    );
    return res.status(200).json({ message: 'Problem updated successfully', problem });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Problem could not be updated' });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Problem ID is required' });

    const existingProblem = await Problem.findById(id).select('_id');
    if (!existingProblem) return res.status(404).json({ message: 'Problem not found' });

    const videos = await SolutionVideo.find({ problemId: existingProblem._id });
    if (videos.length && ![
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET,
    ].every(Boolean)) {
      return res.status(503).json({ message: 'Configure video storage before deleting this problem' });
    }
    for (const video of videos) {
      const result = await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
        resource_type: 'video',
        invalidate: true,
      });
      if (result.result !== 'ok' && result.result !== 'not found') {
        return res.status(502).json({ message: 'Could not remove the attached video; problem was kept' });
      }
    }

    const problem = await Problem.findByIdAndDelete(id);

    await Promise.all([
      SolutionVideo.deleteMany({ problemId: problem._id }),
      Submission.deleteMany({ problemId: problem._id }),
      User.updateMany({}, { $pull: { problemSolved: problem._id } }),
    ]);
    return res.status(200).json({ message: 'Problem and related records deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Problem could not be deleted' });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const video = await SolutionVideo.findOne({ problemId: id });
    const response = problem.toObject();
    if (video) {
      response.secureUrl = video.secureUrl;
      response.thumbnailUrl = video.thumbnailUrl;
      response.duration = video.duration;
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not load problem' });
  }
};

const getProblemForAdmin = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select(
      '_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution problemCreator'
    );
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    return res.status(200).json(problem);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not load problem details' });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const problems = await Problem.find({}).select('_id title difficulty tags').sort({ title: 1 });
    return res.status(200).json(problems);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not load problems' });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const user = await User.findById(req.result._id).populate({
      path: 'problemSolved',
      select: '_id title difficulty tags',
    });
    return res.status(200).json(user?.problemSolved || []);
  } catch {
    return res.status(500).json({ message: 'Could not load solved problems' });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.result._id, problemId: req.params.pid });
    return res.status(200).json(submissions);
  } catch {
    return res.status(500).json({ message: 'Could not load submissions' });
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getProblemForAdmin,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
};
