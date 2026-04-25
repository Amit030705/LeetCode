const { fetchLeetCodeProblem } = require('../src/utils/leetcodeUtility');

async function test() {
  try {
    const data = await fetchLeetCodeProblem('two-sum');
    console.log('Success:', data ? data.title : 'null');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
