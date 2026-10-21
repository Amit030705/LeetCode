const { fetchLeetCodeProblem } = require('../utils/leetcodeUtility');

const topicMap = {
  array: 'array',
  'linked-list': 'linkedList',
  graph: 'graph',
  'dynamic-programming': 'dp',
  math: 'math',
  greedy: 'greedy',
  backtracking: 'backtracking',
  string: 'string',
  tree: 'tree',
  'binary-tree': 'tree',
  'binary-search-tree': 'tree',
  'heap-priority-queue': 'heap',
  heap: 'heap',
  'hash-table': 'hashTable',
  'two-pointers': 'twoPointers',
  'bit-manipulation': 'bitManipulation',
  stack: 'stack',
  queue: 'queue',
  design: 'design',
  recursion: 'recursion',
  'divide-and-conquer': 'divideAndConquer',
  'sliding-window': 'slidingWindow',
  'union-find': 'unionFind',
  'binary-search': 'binary-search',
};

const decodeHtml = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&amp;/gi, '&')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));

const htmlToText = (html) => decodeHtml(html
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(?:p|div|li)>/gi, '\n')
  .replace(/<[^>]*>/g, ''))
  .replace(/\r/g, '')
  .trim();

const extractExamples = (content = '') => {
  const cases = [];
  let blocks = [...content.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi)].map((match) => match[1]);

  // LeetCode now often renders examples as paragraphs inside example-block
  // divs rather than the older <pre> markup.
  if (!blocks.length) {
    blocks = [...content.matchAll(/<div\b[^>]*class=["'][^"']*\bexample-block\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)]
      .map((match) => match[1]);
  }

  for (const block of blocks) {
    const text = htmlToText(block);
    const input = text.match(/(?:^|\n)\s*Input:\s*([\s\S]*?)(?=\n\s*Output:|$)/i)?.[1]?.trim();
    const output = text.match(/(?:^|\n)\s*Output:\s*([\s\S]*?)(?=\n\s*(?:Explanation|Input):|$)/i)?.[1]?.trim();
    const explanation = text.match(/(?:^|\n)\s*Explanation:\s*([\s\S]*?)$/i)?.[1]?.trim() || '';
    if (input && output) cases.push({ input, output, explanation });
  }

  return cases;
};

const getLeetCodeProblem = async (req, res) => {
  const normalizedSlug = String(req.params.slug || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!normalizedSlug) return res.status(400).json({ message: 'LeetCode title slug is required' });

  try {
    const problem = await fetchLeetCodeProblem(normalizedSlug);
    const codeSnippets = (problem.codeSnippets || [])
      .filter((snippet) => ['cpp', 'c++', 'java', 'javascript'].includes(String(snippet.langSlug || snippet.lang).toLowerCase()))
      .map((snippet) => ({
        language: String(snippet.langSlug || snippet.lang).toLowerCase() === 'cpp' ? 'c++' : String(snippet.lang).toLowerCase(),
        initialCode: snippet.code,
      }));

    return res.status(200).json({
      title: problem.title,
      description: problem.content || '',
      difficulty: String(problem.difficulty || 'easy').toLowerCase(),
      tags: (problem.topicTags || []).map((tag) => topicMap[tag.slug]).filter(Boolean),
      visibleTestCases: extractExamples(problem.content),
      codeSnippets,
      sampleTestCase: problem.sampleTestCase || '',
    });
  } catch (error) {
    const notFound = /not found/i.test(error.message || '');
    return res.status(notFound ? 404 : 502).json({
      message: notFound ? error.message : 'Could not fetch this problem from LeetCode. Please try again.',
    });
  }
};

module.exports = { getLeetCodeProblem };
