import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { NavLink, useParams } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  FileText,
  Gauge,
  Lightbulb,
  Maximize2,
  MemoryStick,
  MessageSquare,
  Play,
  Send,
  Terminal,
  XCircle,
} from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { ProductShell } from '../components/ProductShell';
import { formatDifficulty, getDifficultyStyle, getProblemTag } from '../utils/uiHelpers';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
};

const leftTabs = [
  { id: 'description', label: 'Statement', icon: FileText },
  { id: 'editorial', label: 'Editorial', icon: Lightbulb },
  { id: 'solutions', label: 'Solutions', icon: Code2 },
  { id: 'submissions', label: 'Submissions', icon: Clock3 },
  { id: 'chatAI', label: 'AI Coach', icon: Bot },
];

const rightTabs = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'testcase', label: 'Console', icon: Terminal },
  { id: 'result', label: 'Result', icon: Gauge },
];

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
        active ? 'bg-cyan-300 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.18)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ResultMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-1 font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [fullscreenEditor, setFullscreenEditor] = useState(false);
  const editorRef = useRef(null);
  const { problemId } = useParams();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const startCode = response.data.startCode?.find((sc) => sc.language === langMap.javascript)?.initialCode || '';
        setProblem(response.data);
        setCode(startCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find((sc) => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error', testCases: [] });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setSubmitResult(response.data);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: 'Submission failed', passedTestCases: 0, totalTestCases: 0 });
      setActiveRightTab('result');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  if (loading && !problem) {
    return (
      <ProductShell footer={false}>
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell footer={false}>
      <main className="px-3 py-4 sm:px-4 lg:px-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/problems" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Coding Workspace</p>
              <h1 className="text-2xl font-black text-white">{problem?.title || 'Problem'}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${getDifficultyStyle(problem?.difficulty)}`}>{formatDifficulty(problem?.difficulty)}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{getProblemTag(problem)}</span>
          </div>
        </div>

        <div className={`${fullscreenEditor ? 'fixed inset-3 z-[60]' : 'grid min-h-[calc(100vh-8.5rem)] gap-4 xl:grid-cols-[0.9fr_1.1fr]'} `}>
          {!fullscreenEditor && (
            <motion.section initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-white/[0.035] p-3">
                {leftTabs.map((tab) => (
                  <TabButton key={tab.id} active={activeLeftTab === tab.id} onClick={() => setActiveLeftTab(tab.id)} icon={tab.icon} label={tab.label} />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {activeLeftTab === 'description' && problem && (
                  <div>
                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                      <ResultMetric icon={CheckCircle2} label="Acceptance" value="72%" />
                      <ResultMetric icon={Clock3} label="Avg Time" value="24 min" />
                      <ResultMetric icon={MessageSquare} label="Discussion" value="128" />
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-300">{problem.description}</p>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-black text-white">Examples</h3>
                      <div className="mt-4 space-y-4">
                        {problem.visibleTestCases?.map((example, index) => (
                          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                            <h4 className="mb-3 font-black text-white">Example {index + 1}</h4>
                            <div className="space-y-2 font-mono text-sm text-slate-300">
                              <div><span className="text-slate-500">Input:</span> {example.input}</div>
                              <div><span className="text-slate-500">Output:</span> {example.output}</div>
                              <div><span className="text-slate-500">Explanation:</span> {example.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-5">
                      <h3 className="font-black text-cyan-100">Constraints</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Use the visible examples to infer edge cases. Hidden tests validate performance and correctness.</p>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && problem && (
                  <div>
                    <h2 className="mb-5 text-2xl font-black text-white">Editorial</h2>
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                )}

                {activeLeftTab === 'solutions' && problem && (
                  <div>
                    <h2 className="mb-5 text-2xl font-black text-white">Reference Solutions</h2>
                    <div className="space-y-5">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                          <div className="border-b border-white/10 bg-white/[0.04] px-4 py-3 font-black text-white">{solution?.language}</div>
                          <pre className="overflow-x-auto p-4 text-sm text-slate-300"><code>{solution?.completeCode}</code></pre>
                        </div>
                      )) || <p className="text-slate-500">Solutions will be available after you solve the problem.</p>}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                {activeLeftTab === 'chatAI' && problem && <ChatAi problem={problem} />}
              </div>
            </motion.section>
          )}

          <motion.section initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/78 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {rightTabs.map((tab) => (
                  <TabButton key={tab.id} active={activeRightTab === tab.id} onClick={() => setActiveRightTab(tab.id)} icon={tab.icon} label={tab.label} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className="h-10 appearance-none rounded-full border border-white/10 bg-slate-950 px-4 pr-9 text-sm font-black text-white outline-none focus:border-cyan-300/40"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                <button onClick={() => setFullscreenEditor(!fullscreenEditor)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeRightTab === 'code' && (
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => { editorRef.current = editor; }}
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

              {activeRightTab === 'testcase' && (
                <div className="h-full overflow-y-auto p-5">
                  <h3 className="text-xl font-black text-white">Console Output</h3>
                  {runResult ? (
                    <div className="mt-5 space-y-4">
                      <div className={`rounded-2xl border p-5 ${runResult.success ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-red-300/20 bg-red-400/10'}`}>
                        <div className="flex items-center gap-3">
                          {runResult.success ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <XCircle className="h-6 w-6 text-red-300" />}
                          <h4 className="text-lg font-black text-white">{runResult.success ? 'All test cases passed' : runResult.error || 'Some test cases failed'}</h4>
                        </div>
                      </div>
                      {runResult.success && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ResultMetric icon={Gauge} label="Runtime" value={`${runResult.runtime} sec`} />
                          <ResultMetric icon={MemoryStick} label="Memory" value={`${runResult.memory} KB`} />
                        </div>
                      )}
                      {runResult.testCases?.map((tc, index) => (
                        <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-mono text-sm text-slate-300">
                          <div><span className="text-slate-500">Input:</span> {tc.stdin}</div>
                          <div><span className="text-slate-500">Expected:</span> {tc.expected_output}</div>
                          <div><span className="text-slate-500">Output:</span> {tc.stdout}</div>
                          <div className={tc.status_id === 3 ? 'text-emerald-300' : 'text-red-300'}>{tc.status_id === 3 ? 'Passed' : 'Failed'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-500">
                      Run your code to see test case output here.
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'result' && (
                <div className="h-full overflow-y-auto p-5">
                  <h3 className="text-xl font-black text-white">Submission Result</h3>
                  {submitResult ? (
                    <div className="mt-5 space-y-4">
                      <div className={`rounded-2xl border p-5 ${submitResult.accepted ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-red-300/20 bg-red-400/10'}`}>
                        <div className="flex items-center gap-3">
                          {submitResult.accepted ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <XCircle className="h-6 w-6 text-red-300" />}
                          <h4 className="text-lg font-black text-white">{submitResult.accepted ? 'Accepted' : submitResult.error || 'Wrong Answer'}</h4>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <ResultMetric icon={CheckCircle2} label="Tests" value={`${submitResult.passedTestCases || 0}/${submitResult.totalTestCases || 0}`} />
                        <ResultMetric icon={Gauge} label="Runtime" value={submitResult.runtime ? `${submitResult.runtime} sec` : '--'} />
                        <ResultMetric icon={MemoryStick} label="Memory" value={submitResult.memory ? `${submitResult.memory} KB` : '--'} />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-500">
                      Submit your solution to get judged against hidden tests.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/90 p-3">
              <button onClick={() => setActiveRightTab('testcase')} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-300 transition hover:text-white">
                <Terminal className="h-4 w-4" />
                Console
              </button>
              <div className="flex gap-2">
                <button onClick={handleRun} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10 disabled:opacity-60">
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Play className="h-4 w-4" />}
                  Run
                </button>
                <button onClick={handleSubmitCode} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-300 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  Submit
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </ProductShell>
  );
};

export default ProblemPage;
