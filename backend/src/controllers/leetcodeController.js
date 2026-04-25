const { fetchLeetCodeProblem } = require("../utils/leetcodeUtility");

const getLeetCodeProblem = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: "Slug is missing" });
  }

  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

  try {
    const problemData = await fetchLeetCodeProblem(normalizedSlug);

    if (!problemData) {
      return res.status(404).json({ message: `Problem '${normalizedSlug}' not found on LeetCode or API returned null` });
    }

    // Format the response for the frontend
    const formattedProblem = {
      title: problemData.title,
      description: problemData.content,
      difficulty: problemData.difficulty.toLowerCase(),
      tags: problemData.topicTags.map(tag => tag.slug),
      codeSnippets: problemData.codeSnippets,
      sampleTestCase: problemData.sampleTestCase,
      exampleTestcases: problemData.exampleTestcases
    };

    res.status(200).json(formattedProblem);
  } catch (error) {
    res.status(500).json({ message: "Error fetching from LeetCode", error: error.message });
  }
};

module.exports = { getLeetCodeProblem };
