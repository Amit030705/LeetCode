import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { NavLink, useParams } from 'react-router';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  FileText,
  Gauge,
  GripVertical,
  Lightbulb,
  ListChecks,
  Maximize2,
  MemoryStick,
  MessageSquare,
  Minimize2,
  Play,
  Send,
  Tags,
  Terminal,
  XCircle,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import Editorial from '../components/Editorial';
import SubmissionHistory from '../components/SubmissionHistory';
import {
  Button,
  DifficultyBadge,
  EmptyState,
  GlassCard,
  IconButton,
  ProductShell,
  SkeletonBlock,
  StatusBadge,
} from '../components/ProductShell';
import {
  cx,
  formatTag,
  getAcceptanceRate,
  getPopularityScore,
  getProblemTag,
  getProblemTags,
  ui,
} from '../utils/uiHelpers';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript', aliases: ['javascript', 'js'] },
  { value: 'java', label: 'Java', monaco: 'java', aliases: ['java'] },
  { value: 'cpp', label: 'C++', monaco: 'cpp', aliases: ['c++', 'cpp'] },
];

const leftTabs = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'editorial', label: 'Editorial', icon: Lightbulb },
  { id: 'submissions', label: 'Submissions', icon: Clock3 },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
];

const rightTabs = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'testcases', label: 'Test Cases', icon: ListChecks },
  { id: 'output', label: 'Output', icon: Terminal },
];

function normalizeLanguage(language = '') {
  return String(language).toLowerCase().replace(/\s/g, '');
}

function getInitialCode(problem, languageValue) {
  const option = languageOptions.find((item) => item.value === languageValue) || languageOptions[0];
  const starter = problem?.startCode?.find((item) => {
    const language = normalizeLanguage(item.language);
    return option.aliases.some((alias) => normalizeLanguage(alias) === language);
  });

  return starter?.initialCode || '';
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
        active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className={ui.typography.caption}>{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TextContent({ text }) {
  if (!text) {
    return <p className={ui.typography.body}>The statement for this problem is being prepared.</p>;
  }

  return (
    <div 
      className="text-sm leading-7 text-slate-300 [&_p]:mb-4 last:[&_p]:mb-0 [&_pre]:mb-4 [&_pre]:bg-slate-900/80 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-800 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 [&_ol]:space-y-1 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-blue-300 [&_code]:font-mono [&_code]:text-[13px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_strong]:text-slate-200 [&_strong]:font-semibold"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

function ExampleCard({ example, index }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-100">Example {index + 1}</p>
      <div className="space-y-2 font-mono text-sm leading-6 text-slate-300">
        <p>
          <span className="text-slate-500">Input:</span> {example.input}
        </p>
        <p>
          <span className="text-slate-500">Output:</span> {example.output}
        </p>
        {example.explanation && (
          <p>
            <span className="text-slate-500">Explanation:</span> {example.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ runResult, submitResult, lastAction }) {
  const latest = lastAction === 'submit' ? submitResult : runResult;

  if (!latest) {
    return (
      <EmptyState
        icon={Terminal}
        title="No output yet"
        description="Run sample tests or submit your solution to see execution details here."
      />
    );
  }

  const accepted = lastAction === 'submit' ? submitResult?.accepted : runResult?.success;
  const title = lastAction === 'submit' ? (accepted ? 'Accepted' : submitResult?.error || 'Submission failed') : accepted ? 'Sample tests passed' : runResult?.error || 'Sample tests failed';

  return (
    <div className="space-y-4">
      <div className={cx('rounded-lg border p-4', accepted ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-red-400/20 bg-red-400/10')}>
        <div className="flex items-center gap-3">
          {accepted ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-red-300" />}
          <div>
            <p className="font-semibold text-slate-50">{title}</p>
            <p className="mt-1 text-sm text-slate-400">{lastAction === 'submit' ? 'Judged against hidden tests' : 'Executed against visible test cases'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={ListChecks} label="Tests" value={lastAction === 'submit' ? `${submitResult?.passedTestCases || 0}/${submitResult?.totalTestCases || 0}` : `${runResult?.testCases?.filter((item) => item.status_id === 3).length || 0}/${runResult?.testCases?.length || 0}`} />
        <Metric icon={Gauge} label="Runtime" value={latest.runtime ? `${latest.runtime} sec` : '--'} />
        <Metric icon={MemoryStick} label="Memory" value={latest.memory ? `${latest.memory} KB` : '--'} />
      </div>

      {runResult?.testCases?.length && lastAction !== 'submit' ? (
        <div className="space-y-3">
          {runResult.testCases.map((testCase, index) => (
            <div key={index} className="rounded-lg border border-slate-800 bg-slate-950/46 p-4 font-mono text-sm leading-6 text-slate-300">
              <p>
                <span className="text-slate-500">Input:</span> {testCase.stdin}
              </p>
              <p>
                <span className="text-slate-500">Expected:</span> {testCase.expected_output}
              </p>
              <p>
                <span className="text-slate-500">Output:</span> {testCase.stdout || testCase.stderr || '--'}
              </p>
              <StatusBadge status={testCase.status_id === 3 ? 'accepted' : 'wrong'} className="mt-3">
                {testCase.status_id === 3 ? 'Passed' : 'Failed'}
              </StatusBadge>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DiscussionTab() {
  const threads = [
    {
      title: 'How should I think about edge cases?',
      body: 'Start with empty input, one item, repeated values, already sorted data, and maximum constraints before optimizing.',
      replies: 18,
    },
    {
      title: 'What should I improve after getting accepted?',
      body: 'Compare the accepted code with the editorial invariant, then remove duplicated branches and unnecessary state.',
      replies: 11,
    },
    {
      title: 'When should I switch data structures?',
      body: 'If the slowest operation repeats in a loop, choose a structure that makes that exact operation cheaper.',
      replies: 7,
    },
  ];

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <div key={thread.title} className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-100">{thread.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{thread.body}</p>
            </div>
            <span className="shrink-0 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-400">
              {thread.replies} replies
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProblemPage() {
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [executing, setExecuting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [fullscreenEditor, setFullscreenEditor] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(47);
  const workspaceRef = useRef(null);
  const editorRef = useRef(null);
  const { problemId } = useParams();

  useEffect(() => {
    const fetchProblem = async () => {
      setProblemLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        setCode(getInitialCode(response.data, 'javascript'));
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Could not load problem');
      } finally {
        setProblemLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) setCode(getInitialCode(problem, selectedLanguage));
  }, [selectedLanguage, problem]);

  const selectedLanguageOption = languageOptions.find((item) => item.value === selectedLanguage) || languageOptions[0];
  const acceptance = getAcceptanceRate(problem || {}, 0);
  const popularity = getPopularityScore(problem || {}, 0);
  const tags = getProblemTags(problem || {});

  const beginResize = (event) => {
    event.preventDefault();

    const handleMove = (moveEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setLeftPaneWidth(Math.min(60, Math.max(34, percent)));
    };

    const handleEnd = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
  };

  const handleRun = async () => {
    setExecuting(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setRunResult(response.data);
      setLastAction('run');
      setActiveRightTab('output');
      toast.success(response.data?.success ? 'Sample tests passed' : 'Run completed');
    } catch (error) {
      setRunResult({ success: false, error: error?.response?.data || 'Internal server error', testCases: [] });
      setLastAction('run');
      setActiveRightTab('output');
      toast.error('Run failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    setExecuting(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setSubmitResult(response.data);
      setLastAction('submit');
      setActiveRightTab('output');
      toast.success(response.data?.accepted ? 'Accepted' : 'Submission judged');
    } catch (error) {
      setSubmitResult({ accepted: false, error: error?.response?.data || 'Submission failed', passedTestCases: 0, totalTestCases: 0 });
      setLastAction('submit');
      setActiveRightTab('output');
      toast.error('Submit failed');
    } finally {
      setExecuting(false);
    }
  };

  if (problemLoading) {
    return (
      <ProductShell>
        <main className={cx(ui.layout.page, ui.layout.section)}>
          <SkeletonBlock className="mb-5 h-20 w-full" />
          <div className="grid gap-4 xl:grid-cols-2">
            <SkeletonBlock className="h-[640px]" />
            <SkeletonBlock className="h-[640px]" />
          </div>
        </main>
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <main className="px-3 py-4 sm:px-4 lg:px-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/problems" className={ui.button.icon} aria-label="Back to problems">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
            <div className="min-w-0">
              <p className={ui.typography.overline}>Problem Workspace</p>
              <h1 className="mt-1 truncate text-2xl font-semibold text-slate-50">{problem?.title || 'Problem'}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem?.difficulty} />
            {tags.map((tag) => (
              <span key={tag} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2.5 text-xs font-semibold text-slate-400">
                <Tags className="h-3.5 w-3.5" />
                {formatTag(tag)}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={workspaceRef}
          style={{ '--left-pane': `${leftPaneWidth}%` }}
          className={cx(
            fullscreenEditor
              ? 'fixed inset-3 z-[70] grid rounded-lg border border-slate-800 bg-slate-950 shadow-2xl'
              : 'grid min-h-[calc(100vh-8rem)] gap-4 xl:grid-cols-[var(--left-pane)_8px_minmax(0,1fr)] xl:gap-0',
          )}
        >
          {!fullscreenEditor && (
            <GlassCard animate={false} className="flex min-h-[620px] flex-col overflow-hidden xl:rounded-r-none">
              <div className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950/42 p-2">
                {leftTabs.map((tab) => (
                  <TabButton key={tab.id} active={activeLeftTab === tab.id} onClick={() => setActiveLeftTab(tab.id)} icon={tab.icon} label={tab.label} />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {activeLeftTab === 'description' && (
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric icon={CheckCircle2} label="Acceptance" value={`${acceptance}%`} />
                      <Metric icon={Gauge} label="Frequency" value={popularity} />
                      <Metric icon={BookOpen} label="Topic" value={formatTag(getProblemTag(problem))} />
                    </div>

                    <section>
                      <h2 className={ui.typography.h2}>Statement</h2>
                      <div className="mt-3">
                        <TextContent text={problem?.description} />
                      </div>
                    </section>

                    <section>
                      <h2 className={ui.typography.h2}>Examples</h2>
                      <div className="mt-3 space-y-3">
                        {problem?.visibleTestCases?.length ? (
                          problem.visibleTestCases.map((example, index) => <ExampleCard key={index} example={example} index={index} />)
                        ) : (
                          <EmptyState icon={ListChecks} title="No visible examples" description="Sample cases will appear here when available." />
                        )}
                      </div>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
                        <h3 className={ui.typography.h3}>Constraints</h3>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                          <li>Inputs follow the exact format shown in the examples.</li>
                          <li>Hidden tests include edge cases and larger performance cases.</li>
                          <li>Prefer the simplest solution that matches the expected complexity.</li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-950/46 p-4">
                        <h3 className={ui.typography.h3}>Hints</h3>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                          <li>Define the invariant before writing code.</li>
                          <li>Dry run the first visible example manually.</li>
                          <li>Check boundary cases before submitting.</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <Editorial problem={problem} secureUrl={problem?.secureUrl} thumbnailUrl={problem?.thumbnailUrl} duration={problem?.duration} />
                )}

                {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}

                {activeLeftTab === 'discussion' && <DiscussionTab />}
              </div>
            </GlassCard>
          )}

          {!fullscreenEditor && (
            <button
              onPointerDown={beginResize}
              className="hidden cursor-col-resize items-center justify-center bg-slate-900 text-slate-600 transition hover:bg-blue-500/10 hover:text-blue-300 xl:flex"
              aria-label="Resize panels"
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}

          <GlassCard animate={false} className={cx('flex min-h-[620px] flex-col overflow-hidden', fullscreenEditor ? 'h-full' : 'xl:rounded-l-none')}>
            <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/42 p-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1 overflow-x-auto">
                {rightTabs.map((tab) => (
                  <TabButton key={tab.id} active={activeRightTab === tab.id} onClick={() => setActiveRightTab(tab.id)} icon={tab.icon} label={tab.label} />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className={cx(ui.select, 'w-[136px] appearance-none pr-8')}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                <IconButton onClick={() => setFullscreenEditor((value) => !value)} aria-label={fullscreenEditor ? 'Exit fullscreen' : 'Fullscreen editor'}>
                  {fullscreenEditor ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </IconButton>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {activeRightTab === 'code' && (
                <Editor
                  height="100%"
                  language={selectedLanguageOption.monaco}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    padding: { top: 18, bottom: 18 },
                  }}
                />
              )}

              {activeRightTab === 'testcases' && (
                <div className="h-full overflow-y-auto p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className={ui.typography.h2}>Test Cases</h2>
                      <p className={cx(ui.typography.body, 'mt-1')}>Visible examples used for local runs.</p>
                    </div>
                    <StatusBadge status="pending">{problem?.visibleTestCases?.length || 0} cases</StatusBadge>
                  </div>
                  <div className="space-y-3">
                    {problem?.visibleTestCases?.map((example, index) => <ExampleCard key={index} example={example} index={index} />)}
                  </div>
                </div>
              )}

              {activeRightTab === 'output' && (
                <div className="h-full overflow-y-auto p-4 sm:p-5">
                  <div className="mb-4">
                    <h2 className={ui.typography.h2}>Output</h2>
                    <p className={cx(ui.typography.body, 'mt-1')}>Run and submission results stay here while you iterate.</p>
                  </div>
                  <ResultPanel runResult={runResult} submitResult={submitResult} lastAction={lastAction} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/86 p-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" onClick={() => setActiveRightTab('testcases')}>
                <ListChecks className="h-4 w-4" />
                Test Cases
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleRun} disabled={executing}>
                  {executing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-slate-100" /> : <Play className="h-4 w-4" />}
                  Run
                </Button>
                <Button onClick={handleSubmitCode} disabled={executing}>
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </ProductShell>
  );
}

export default ProblemPage;
