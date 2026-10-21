import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ProductShell, GlassCard, Button } from '../components/ProductShell';
import {
  Plus,
  Edit,
  Trash2,
  Video,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileJson,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import { cx, ui } from '../utils/uiHelpers';

const getRequestError = (error, fallback) =>
  error.response?.data?.message ||
  (typeof error.response?.data === 'string' ? error.response.data : null) ||
  error.message ||
  fallback;

const PROBLEM_LANGUAGES = ['C++', 'Java', 'JavaScript'];

const languageKey = (language = '') => {
  const normalized = String(language).trim().toLowerCase();
  return normalized === 'cpp' ? 'c++' : normalized;
};

const normalizeLanguageEntries = (entries, codeField) => PROBLEM_LANGUAGES.map((language) => {
  const existing = (Array.isArray(entries) ? entries : []).find(
    (entry) => languageKey(entry?.language) === languageKey(language)
  );
  return {
    language,
    [codeField]: typeof existing?.[codeField] === 'string' ? existing[codeField] : '',
  };
});

const normalizeProblemFormat = (data = {}) => ({
  title: data.title || '',
  description: data.description || '',
  difficulty: data.difficulty || 'easy',
  tags: Array.isArray(data.tags) ? data.tags[0] || 'array' : data.tags || 'array',
  visibleTestCases: data.visibleTestCases?.length
    ? data.visibleTestCases
    : [{ input: '', output: '', explanation: '' }],
  hiddenTestCases: data.hiddenTestCases?.length
    ? data.hiddenTestCases
    : [{ input: '', output: '' }],
  startCode: normalizeLanguageEntries(data.startCode, 'initialCode'),
  referenceSolution: normalizeLanguageEntries(data.referenceSolution, 'completeCode'),
});

const SUM_SAMPLE_PROBLEM = {
  title: 'sum of two numbers',
  description: 'Write a program that takes two integers as input and returns their sum.',
  difficulty: 'easy',
  tags: 'array',
  visibleTestCases: [
    { input: '2 3', output: '5', explanation: '2 + 3 equals 5' },
    { input: '-1 5', output: '4', explanation: '-1 + 5 equals 4' },
  ],
  hiddenTestCases: [
    { input: '10 20', output: '30' },
    { input: '100 250', output: '350' },
  ],
  startCode: [
    {
      language: 'C++',
      initialCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    // Read input here\n    cout << a + b;\n    return 0;\n}',
    },
    {
      language: 'Java',
      initialCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Read input here\n    }\n}',
    },
    {
      language: 'JavaScript',
      initialCode: "const readline = require('readline');\n\n// Complete input handling here",
    },
  ],
  referenceSolution: [
    {
      language: 'C++',
      completeCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}',
    },
    {
      language: 'Java',
      completeCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}',
    },
    {
      language: 'JavaScript',
      completeCode: "const input = require('fs').readFileSync(0, 'utf-8').trim();\nconst [a, b] = input.split(/\\s+/).map(Number);\nconsole.log(a + b);",
    },
  ],
};

function AdminCard({ icon: Icon, title, description, buttonText, color, eyebrow, onClick, className }) {
  const themes = {
    emerald: {
      icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
      glow: 'bg-emerald-400/10',
      action: 'group-hover:border-emerald-400/30 group-hover:bg-emerald-400/10 group-hover:text-emerald-200',
      arrow: 'text-emerald-300',
    },
    amber: {
      icon: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
      glow: 'bg-amber-400/10',
      action: 'group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:text-amber-200',
      arrow: 'text-amber-300',
    },
    rose: {
      icon: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
      glow: 'bg-rose-400/10',
      action: 'group-hover:border-rose-400/30 group-hover:bg-rose-400/10 group-hover:text-rose-200',
      arrow: 'text-rose-300',
    },
    blue: {
      icon: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
      glow: 'bg-blue-400/10',
      action: 'group-hover:border-blue-400/30 group-hover:bg-blue-400/10 group-hover:text-blue-200',
      arrow: 'text-blue-300',
    },
  };
  const theme = themes[color] || themes.blue;

  return (
    <GlassCard
      className={cx(
        'group relative isolate flex min-h-[238px] flex-col overflow-hidden rounded-2xl border-slate-800/90 bg-slate-900/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-[0_28px_70px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <div className={cx('pointer-events-none absolute -right-12 -top-16 -z-10 h-44 w-44 rounded-full blur-3xl opacity-40 transition duration-300 group-hover:opacity-80', theme.glow)} />
      <div className="flex items-center justify-between">
        <div className={cx('grid h-12 w-12 place-items-center rounded-2xl border shadow-inner', theme.icon)}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <span className="rounded-full border border-slate-700/80 bg-slate-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {eyebrow}
        </span>
      </div>
      <div className="mt-6 flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={cx(
          'mt-5 inline-flex h-11 w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/45 px-4 text-sm font-semibold text-slate-300 transition focus:outline-none focus:ring-4 focus:ring-blue-500/10',
          theme.action,
        )}
      >
        <span>{buttonText}</span>
        <ArrowRight className={cx('h-4 w-4 transition-transform group-hover:translate-x-1', theme.arrow)} />
      </button>
    </GlassCard>
  );
}

function DeleteProblemForm() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');

  const diffColors = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-red-400',
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/problem/getAllProblem');
      setProblems(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProblems(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      toast.success('Problem deleted successfully');
      setConfirmId(null);
      fetchProblems();
    } catch (err) {
      toast.error(getRequestError(err, 'Failed to delete problem'));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = problems.filter(p => {
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Delete Problems</h3>
        <div className="text-slate-400 text-sm">Loading problems...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Delete Problems</h3>
        <span className="text-xs text-slate-500">{problems.length} problems total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={cx(ui.input, "flex-1")}
        />
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className={cx(ui.select, "w-full sm:w-36")}
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No problems match your filters</div>
        ) : (
          filtered.map((problem) => {
            const isConfirming = confirmId === problem._id;
            const isDeleting = deletingId === problem._id;

            return (
              <div
                key={problem._id}
                className={cx(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 transition",
                  isConfirming ? "border-red-500/40 bg-red-500/5" : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{problem.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cx("text-xs font-medium capitalize", diffColors[problem.difficulty] || "text-slate-400")}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-600">ID: {problem._id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isConfirming ? (
                    <>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50"
                      >
                        {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(problem._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ImportLeetCodeForm({ onDone }) {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedJson, setFetchedJson] = useState('');
  const [manualImport, setManualImport] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/problem/fetch-leetcode/${encodeURIComponent(slug.trim())}`);
      setManualImport(false);
      
      // Transform fetched data to match our schema as closely as possible
      const transformed = {
        ...normalizeProblemFormat(data),
        startCode: normalizeLanguageEntries(data.codeSnippets, 'initialCode'),
      };

      setFetchedJson(JSON.stringify(transformed, null, 2));
      toast.success('Problem fetched. Please review and save.');
    } catch (err) {
      toast.error(getRequestError(err, 'Failed to fetch problem'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = JSON.parse(fetchedJson);
      await axiosClient.post('/problem/create', payload);
      toast.success('Problem saved to MongoDB successfully');
      onDone();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(getRequestError(err, 'Failed to save problem'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-300/80">Problem intake</p>
        <h3 className="text-xl font-semibold tracking-tight text-slate-100">Import a problem</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-400">Fetch by LeetCode slug or paste a complete problem in your platform&apos;s JSON format.</p>
      </div>
      
      {!fetchedJson ? (
        <div className="space-y-4">
          <form onSubmit={handleFetch} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-400 mb-1">LeetCode Title Slug</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={cx(ui.input, "w-full")}
                placeholder="e.g. first-unique-character-in-a-string"
                required
              />
            </label>
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                {loading ? 'Fetching...' : 'Fetch from LeetCode'}
              </Button>
            </div>
          </form>
          <div className="relative py-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <span className="relative z-10 bg-slate-900 px-3">or</span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-slate-700" />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setManualImport(true);
              setFetchedJson(JSON.stringify(normalizeProblemFormat(), null, 2));
            }}
          >
            Paste complete problem JSON
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              {manualImport ? 'Paste the complete problem JSON' : 'Review and complete the imported problem JSON'}
            </span>
            <textarea 
              value={fetchedJson} 
              onChange={(e) => setFetchedJson(e.target.value)} 
              className={cx(ui.input, "h-[65vh] min-h-96 w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-4 font-mono text-[13px] leading-6 text-slate-700 shadow-inner focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10")}
              spellCheck="false"
            />
          </label>
          <p className="text-sm text-amber-300/90">
            {manualImport
              ? 'Use the complete format: visibleTestCases, hiddenTestCases, startCode, and referenceSolution with C++, Java, and JavaScript entries.'
              : 'LeetCode does not provide hidden tests or complete reference programs. Fill every expected output, all three starter programs, and all three complete reference solutions. Convert imported examples and code to this app’s standard input/output format.'}
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => { setFetchedJson(''); setManualImport(false); }} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
              {loading ? 'Saving...' : 'Save to MongoDB'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateProblemForm({ onDone }) {
  const [json, setJson] = useState(() => JSON.stringify(SUM_SAMPLE_PROBLEM, null, 2));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = JSON.parse(json);
      await axiosClient.post('/problem/create', payload);
      toast.success('Problem created successfully');
      onDone();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create problem');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300/80">Problem authoring</p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-100">Create a problem</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
            Edit the JSON below. Include visible and hidden cases, starter code, and complete reference solutions for all three languages.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setJson(JSON.stringify(normalizeProblemFormat(), null, 2))}
          variant="secondary"
          className="shrink-0 rounded-xl border-slate-700 bg-slate-900/80"
        >
          Reset template
        </Button>
      </div>
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Problem JSON</span>
          <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-500">JSON</span>
        </span>
        <textarea 
          value={json} 
          onChange={(e) => setJson(e.target.value)} 
          className={cx(ui.input, "h-[65vh] min-h-96 w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-4 font-mono text-[13px] leading-6 text-slate-700 shadow-inner focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10")}
          required
          spellCheck="false"
          aria-label="Problem JSON"
        />
      </label>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-500 text-emerald-950 shadow-[0_12px_30px_rgba(16,185,129,0.16)] hover:bg-emerald-400">
          {loading ? 'Creating problem...' : 'Create problem'}
        </Button>
      </div>
    </form>
  );
}

function UpdateProblemForm() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editJson, setEditJson] = useState('');
  const [fetchingId, setFetchingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const diffColors = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-red-400',
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/problem/getAllProblem');
      setProblems(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProblems(); }, []);

  const handleEdit = async (problemId) => {
    setFetchingId(problemId);
    try {
      const res = await axiosClient.get(`/problem/admin/problemById/${problemId}`);
      const data = res.data;
      // Remove fields that shouldn't be edited or are read-only
      const editable = normalizeProblemFormat(data);
      setEditJson(JSON.stringify(editable, null, 2));
      setEditingId(problemId);
    } catch {
      toast.error('Failed to fetch problem details');
    } finally {
      setFetchingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = JSON.parse(editJson);
      await axiosClient.put(`/problem/update/${editingId}`, payload);
      toast.success('Problem updated successfully');
      setEditingId(null);
      setEditJson('');
      fetchProblems();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(getRequestError(err, 'Failed to update problem'));
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = problems.filter(p => {
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Update Problems</h3>
        <div className="text-slate-400 text-sm">Loading problems...</div>
      </div>
    );
  }

  // If editing a specific problem, show the JSON editor
  if (editingId) {
    const editingProblem = problems.find(p => p._id === editingId);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingId(null); setEditJson(''); }}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">Editing: {editingProblem?.title || editingId}</h3>
        </div>
        <p className="text-xs text-slate-500">ID: {editingId}</p>
        <label className="block">
          <span className="block text-sm font-medium text-slate-400 mb-1">Problem JSON</span>
          <textarea
            value={editJson}
            onChange={(e) => setEditJson(e.target.value)}
            className={cx(ui.input, "w-full h-96 font-mono text-sm")}
          />
        </label>
        <div className="flex gap-3 pt-2">
          <Button onClick={() => { setEditingId(null); setEditJson(''); }} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Update Problems</h3>
        <span className="text-xs text-slate-500">{problems.length} problems total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={cx(ui.input, "flex-1")}
        />
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className={cx(ui.select, "w-full sm:w-36")}
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No problems match your filters</div>
        ) : (
          filtered.map((problem) => {
            const isFetching = fetchingId === problem._id;

            return (
              <div
                key={problem._id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3 transition hover:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{problem.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cx("text-xs font-medium capitalize", diffColors[problem.difficulty] || "text-slate-400")}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-600">ID: {problem._id}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(problem._id)}
                  disabled={isFetching}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50"
                >
                  {isFetching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Edit className="w-3 h-3" />}
                  {isFetching ? 'Loading...' : 'Edit'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function VideoProblemForm() {
  const [problems, setProblems] = useState([]);
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [problemRes, videoRes] = await Promise.all([
        axiosClient.get('/problem/getAllProblem'),
        axiosClient.get('/video/all'),
      ]);
      setProblems(Array.isArray(problemRes.data) ? problemRes.data : []);
      const videoMap = {};
      (Array.isArray(videoRes.data) ? videoRes.data : []).forEach(v => {
        videoMap[v.problemId] = v;
      });
      setVideos(videoMap);
    } catch (err) {
      toast.error(getRequestError(err, 'Failed to load video problems'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (problemId, file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be less than 100MB');
      return;
    }
    setUploadingId(problemId);
    setUploadProgress(0);
    try {
      // Step 1: Get Cloudinary signature from backend
      const { data: sig } = await axiosClient.get(`/video/create/${problemId}`);

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('public_id', sig.public_id);

      const uploadRes = await axios.post(sig.upload_url, formData, {
        timeout: 5 * 60 * 1000,
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      const cloudData = uploadRes.data;

      // Step 3: Save metadata to our backend
      await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudData.public_id,
        secureUrl: cloudData.secure_url,
        duration: cloudData.duration || 0,
      });

      toast.success('Video uploaded successfully!');
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || getRequestError(err, 'Upload failed'));
    } finally {
      setUploadingId(null);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (problemId) => {
    setDeletingId(problemId);
    try {
      await axiosClient.delete(`/video/delete/${problemId}`);
      toast.success('Video deleted');
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || getRequestError(err, 'Delete failed'));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = problems.filter(p => {
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
    if (statusFilter === 'with' && !videos[p._id]) return false;
    if (statusFilter === 'without' && videos[p._id]) return false;
    return true;
  });

  const diffColors = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-red-400',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Manage Video Solutions</h3>
        <div className="text-slate-400 text-sm">Loading problems...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Manage Video Solutions</h3>
        <span className="text-xs text-slate-500">
          {Object.keys(videos).length}/{problems.length} videos uploaded
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={cx(ui.input, "flex-1")}
        />
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className={cx(ui.select, "w-full sm:w-36")}
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cx(ui.select, "w-full sm:w-40")}
        >
          <option value="all">All statuses</option>
          <option value="with">Has video</option>
          <option value="without">No video</option>
        </select>
      </div>

      {/* Problem List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No problems match your filters</div>
        ) : (
          filtered.map((problem) => {
            const hasVideo = !!videos[problem._id];
            const isUploading = uploadingId === problem._id;
            const isDeleting = deletingId === problem._id;

            return (
              <div
                key={problem._id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3 transition hover:border-slate-700"
              >
                {/* Video status indicator */}
                <div className={cx(
                  "w-2 h-2 rounded-full shrink-0",
                  hasVideo ? "bg-emerald-400" : "bg-slate-600"
                )} />

                {/* Problem info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{problem.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cx("text-xs font-medium capitalize", diffColors[problem.difficulty] || "text-slate-400")}>
                      {problem.difficulty}
                    </span>
                    {hasVideo && (
                      <span className="text-xs text-emerald-400/70 flex items-center gap-1">
                        <Video className="w-3 h-3" /> Video attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {hasVideo ? (
                    <>
                      <a
                        href={videos[problem._id].secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition"
                      >
                        <Video className="w-3 h-3" /> View
                      </a>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  ) : (
                    <label className={cx(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer",
                      isUploading
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    )}>
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Uploading {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={Boolean(uploadingId)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(problem._id, file);
                              e.target.value = '';
                            }}
                          />
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useSelector(state => state.auth);
  const [activeForm, setActiveForm] = useState(null);
  
  if (user?.role !== 'admin') {
    return (
      <ProductShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <AlertCircle className="w-16 h-16 mb-4 text-rose-500/80" />
          <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
          <p className="mt-2">You do not have permission to view this page.</p>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <main className={cx(ui.layout.page, 'relative isolate py-8 sm:py-10 lg:py-12')}>
        {!activeForm ? (
          <>
            <section className="relative isolate mb-8 overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/55 px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:px-9 sm:py-9">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.08),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.45),rgba(239,246,255,0.75))]" />
              <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-200 shadow-[0_12px_40px_rgba(37,99,235,0.15)] sm:grid">
                    <ShieldCheck className="h-6 w-6" strokeWidth={1.7} />
                  </div>
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200">
                      <Sparkles className="h-3.5 w-3.5" /> Admin workspace
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.1rem]">
                      Problem management
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                      Create, maintain, and publish coding problems with reliable tests and solutions.
                    </p>
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/45 px-4 py-3 sm:flex">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300">
                    <FileJson className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Problem tools</p>
                    <p className="mt-0.5 text-xs text-slate-500">5 workspace actions</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mb-4 flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
                <h2 className="mt-1 text-base font-semibold text-slate-200">Choose an action</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">5 tools</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:gap-5">
              <AdminCard
                icon={Plus}
                eyebrow="Build"
                title="Create a problem"
                description="Write a new challenge, add reliable test cases, and provide solutions in each supported language."
                buttonText="Start creating"
                color="emerald"
                className="sm:col-span-2 xl:col-span-3"
                onClick={() => setActiveForm('create')}
              />
              <AdminCard
                icon={Edit}
                eyebrow="Maintain"
                title="Update a problem"
                description="Find an existing challenge and refine its description, test cases, or language solutions."
                buttonText="Browse problems"
                color="amber"
                className="sm:col-span-2 xl:col-span-3"
                onClick={() => setActiveForm('update')}
              />
              <AdminCard
                icon={Trash2}
                eyebrow="Manage"
                title="Delete a problem"
                description="Search the problem library and remove an entry with a clear confirmation step."
                buttonText="Manage problems"
                color="rose"
                className="xl:col-span-2"
                onClick={() => setActiveForm('delete')}
              />
              <AdminCard
                icon={Video}
                eyebrow="Media"
                title="Solution videos"
                description="Attach and manage solution videos for problems in your library."
                buttonText="Manage videos"
                color="emerald"
                className="xl:col-span-2"
                onClick={() => setActiveForm('video')}
              />
              <AdminCard
                icon={RefreshCw}
                eyebrow="Import"
                title="Import from LeetCode"
                description="Fetch a problem by its title slug or import a complete problem JSON object."
                buttonText="Open importer"
                color="blue"
                className="xl:col-span-2"
                onClick={() => setActiveForm('import')}
              />
            </div>
          </>
        ) : (
          <div className={cx(['video', 'delete', 'update'].includes(activeForm) ? 'max-w-5xl' : 'max-w-4xl', 'mx-auto')}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setActiveForm(null)}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <ArrowLeft className="h-4 w-4" /> All admin tools
              </button>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Admin access verified
              </span>
            </div>
            <GlassCard className="rounded-2xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
              {activeForm === 'create' && <CreateProblemForm onDone={() => setActiveForm(null)} />}
              {activeForm === 'update' && <UpdateProblemForm />}
              {activeForm === 'delete' && <DeleteProblemForm />}
              {activeForm === 'video' && <VideoProblemForm />}
              {activeForm === 'import' && <ImportLeetCodeForm onDone={() => setActiveForm(null)} />}
            </GlassCard>
          </div>
        )}
      </main>
    </ProductShell>
  );
}
