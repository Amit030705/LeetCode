import { BookOpen, Braces, CheckCircle2, Code2, Cpu, Lightbulb, PlayCircle } from 'lucide-react';
import { cx, formatDifficulty, formatTag, getProblemTag, ui } from '../utils/uiHelpers';

const languageBlocks = [
  {
    key: 'cpp',
    label: 'C++',
    aliases: ['c++', 'cpp'],
    fallback: `class Solution {
public:
    int solve(vector<int>& nums) {
        // Build the invariant first, then update state in one pass.
        int answer = 0;
        for (int value : nums) {
            answer = max(answer, value);
        }
        return answer;
    }
};`,
  },
  {
    key: 'java',
    label: 'Java',
    aliases: ['java'],
    fallback: `class Solution {
    public int solve(int[] nums) {
        int answer = 0;
        for (int value : nums) {
            answer = Math.max(answer, value);
        }
        return answer;
    }
}`,
  },
  {
    key: 'python',
    label: 'Python',
    aliases: ['python', 'python3'],
    fallback: `class Solution:
    def solve(self, nums):
        answer = 0
        for value in nums:
            answer = max(answer, value)
        return answer`,
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    aliases: ['javascript', 'js'],
    fallback: `function solve(nums) {
  let answer = 0;
  for (const value of nums) {
    answer = Math.max(answer, value);
  }
  return answer;
}`,
  },
];

function normalizeLanguage(language = '') {
  return String(language).toLowerCase().replace(/\s/g, '');
}

function getReferenceSolution(problem, block) {
  const solution = problem?.referenceSolution?.find((item) => {
    const language = normalizeLanguage(item.language);
    return block.aliases.some((alias) => normalizeLanguage(alias) === language);
  });

  return solution?.completeCode || block.fallback;
}

function MarkdownSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={ui.typography.h3}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function CodeSnippet({ label, code }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <Code2 className="h-4 w-4 text-slate-500" />
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-sm leading-6 text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Editorial({ problem, secureUrl, thumbnailUrl }) {
  const topic = formatTag(getProblemTag(problem));
  const difficulty = formatDifficulty(problem?.difficulty);

  return (
    <div className="space-y-4">
      <MarkdownSection icon={BookOpen} title="Overview">
        <div className="space-y-3 text-sm leading-7 text-slate-300">
          <p>
            Treat this as a {difficulty.toLowerCase()} {topic.toLowerCase()} problem. Start by identifying the state you need to carry between
            iterations, then prove that every update preserves the answer for the processed prefix.
          </p>
          <p>
            The accepted approach should be simple to reason about, avoid unnecessary nested scans, and keep the implementation close to the input
            constraints.
          </p>
        </div>
      </MarkdownSection>

      <MarkdownSection icon={Lightbulb} title="Approach">
        <ol className="space-y-3 text-sm leading-7 text-slate-300">
          <li className="flex gap-3">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-800 text-xs font-semibold text-slate-300">1</span>
            Read the examples and write down the invariant that must be true after each step.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-800 text-xs font-semibold text-slate-300">2</span>
            Choose the smallest data structure that gives constant or logarithmic lookup for the operation you repeat most.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-800 text-xs font-semibold text-slate-300">3</span>
            Iterate once, update the state, and return the accumulated answer only after edge cases are covered.
          </li>
        </ol>
      </MarkdownSection>

      <div className="grid gap-4 md:grid-cols-2">
        <MarkdownSection icon={Cpu} title="Time Complexity">
          <p className={cx(ui.typography.body, 'font-mono')}>O(n) for a single pass over the input.</p>
        </MarkdownSection>
        <MarkdownSection icon={Braces} title="Space Complexity">
          <p className={cx(ui.typography.body, 'font-mono')}>O(1) to O(n), depending on whether the chosen state needs auxiliary storage.</p>
        </MarkdownSection>
      </div>

      <MarkdownSection icon={CheckCircle2} title="Implementation Notes">
        <ul className="space-y-2 text-sm leading-7 text-slate-300">
          <li>Keep parsing separate from the core algorithm so local tests are easy to debug.</li>
          <li>Return early for empty or minimal input when the statement allows it.</li>
          <li>Use names that reflect the invariant, not temporary mechanics.</li>
        </ul>
      </MarkdownSection>

      {secureUrl && (
        <MarkdownSection icon={PlayCircle} title="Video Walkthrough">
          <video src={secureUrl} poster={thumbnailUrl} controls className="aspect-video w-full rounded-lg border border-slate-800 bg-black" />
        </MarkdownSection>
      )}

      <MarkdownSection icon={Code2} title="Reference Code">
        <div className="grid gap-4">
          {languageBlocks.map((block) => (
            <CodeSnippet key={block.key} label={block.label} code={getReferenceSolution(problem, block)} />
          ))}
        </div>
      </MarkdownSection>
    </div>
  );
}

export default Editorial;
