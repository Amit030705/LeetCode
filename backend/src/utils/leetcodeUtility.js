const axios = require('axios');

const fetchLeetCodeProblem = async (titleSlug) => {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        stats
        hints
        exampleTestcases
        sampleTestCase
      }
    }
  `;

  const variables = { titleSlug };

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.question;
  } catch (error) {
    console.error('Error fetching LeetCode problem:', error.message);
    throw error;
  }
};

module.exports = { fetchLeetCodeProblem };
