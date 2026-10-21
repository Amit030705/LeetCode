const axios = require('axios');

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

const getLanguageById = (language = '') => {
  const languageIds = {
    'c++': 54,
    cpp: 54,
    java: 62,
    javascript: 63,
  };

  return languageIds[String(language).toLowerCase()];
};

const getJudge0Headers = () => {
  if (!process.env.JUDGE0_KEY) {
    throw new Error('JUDGE0_KEY is not configured');
  }

  return {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': JUDGE0_HOST,
    'Content-Type': 'application/json',
  };
};

const submitBatch = async (submissions) => {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    throw new Error('At least one test submission is required');
  }

  const { data } = await axios.post(`${JUDGE0_URL}/submissions/batch`, {
    submissions,
  }, {
    params: { base64_encoded: 'false' },
    headers: getJudge0Headers(),
    timeout: 20000,
  });

  if (!Array.isArray(data) || data.some((item) => !item.token)) {
    throw new Error('Judge0 did not return submission tokens');
  }

  return data;
};

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const submitToken = async (resultTokens) => {
  if (!Array.isArray(resultTokens) || resultTokens.length === 0) {
    throw new Error('No Judge0 submission tokens were provided');
  }

  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const remainingMs = deadline - Date.now();
    const { data } = await axios.get(`${JUDGE0_URL}/submissions/batch`, {
      params: {
        tokens: resultTokens.join(','),
        base64_encoded: 'false',
        fields: '*',
      },
      headers: getJudge0Headers(),
      timeout: Math.min(10000, remainingMs),
    });

    const submissions = data?.submissions;
    if (!Array.isArray(submissions) || submissions.length !== resultTokens.length) {
      throw new Error('Judge0 returned an invalid result');
    }

    if (submissions.every((submission) => Number(submission.status_id) > 2)) {
      return submissions;
    }

    await delay(Math.min(1000, Math.max(0, deadline - Date.now())));
  }

  throw new Error('Judge0 timed out while running the reference solutions');
};

module.exports = { getLanguageById, submitBatch, submitToken };
