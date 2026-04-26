import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ProductShell, GlassCard, Button } from '../components/ProductShell';
import { Plus, Edit, Trash2, Video, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import { cx, ui } from '../utils/uiHelpers';

function AdminCard({ icon: Icon, title, description, buttonText, color, onClick }) {
  const colorStyles = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950',
    amber: 'bg-amber-500 hover:bg-amber-400 text-amber-950',
    rose: 'bg-rose-500 hover:bg-rose-400 text-white',
    blue: 'bg-blue-500 hover:bg-blue-400 text-white'
  };

  const iconStyles = {
    emerald: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    amber: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
    rose: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
    blue: 'text-blue-400 border-blue-400/20 bg-blue-400/10'
  };

  return (
    <GlassCard className="flex flex-col items-center text-center p-8 transition hover:bg-slate-900/50">
      <div className={cx("w-12 h-12 rounded-full border flex items-center justify-center mb-4", iconStyles[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 flex-1">{description}</p>
      <button 
        onClick={onClick}
        className={cx("px-4 py-2 rounded-md font-medium text-sm transition w-full", colorStyles[color])}
      >
        {buttonText}
      </button>
    </GlassCard>
  );
}

function DeleteProblemForm({ onDone }) {
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
      toast.error(err.response?.data?.message || typeof err.response?.data === 'string' ? err.response?.data : 'Failed to delete');
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

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/problem/fetch-leetcode/${slug}`);
      
      // Transform fetched data to match our schema as closely as possible
      const transformed = {
        title: data.title || '',
        description: data.description || '',
        difficulty: data.difficulty || 'easy',
        tags: (data.tags && data.tags[0]) || 'array', // Schema only accepts enum strings like 'array', 'binary-search', etc.
        visibleTestCases: [
          {
            input: data.sampleTestCase || '',
            output: '',
            explanation: ''
          }
        ],
        hiddenTestCases: [],
        startCode: (data.codeSnippets || []).map(snippet => ({
          language: snippet.lang,
          initialCode: snippet.code
        })),
        referenceSolution: []
      };

      setFetchedJson(JSON.stringify(transformed, null, 2));
      toast.success('Problem fetched. Please review and save.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch problem');
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
        toast.error(err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || 'Failed to save problem');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Import from LeetCode</h3>
      
      {!fetchedJson ? (
        <form onSubmit={handleFetch} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-400 mb-1">LeetCode Title Slug</span>
            <input 
              type="text" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              className={cx(ui.input, "w-full")}
              placeholder="e.g. search-insert-position"
              required
            />
          </label>
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              {loading ? 'Fetching...' : 'Fetch from LeetCode'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-400 mb-1">Review & Modify JSON format for MongoDB</span>
            <textarea 
              value={fetchedJson} 
              onChange={(e) => setFetchedJson(e.target.value)} 
              className={cx(ui.input, "w-full h-80 font-mono text-sm")}
            />
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setFetchedJson('')} variant="secondary" className="flex-1">
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
  const [json, setJson] = useState('{\n  "title": "",\n  "description": "",\n  "difficulty": "easy",\n  "tags": "array",\n  "visibleTestCases": [],\n  "hiddenTestCases": [],\n  "startCode": [],\n  "referenceSolution": []\n}');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Create Problem (Raw JSON)</h3>
      <label className="block">
        <textarea 
          value={json} 
          onChange={(e) => setJson(e.target.value)} 
          className={cx(ui.input, "w-full h-64 font-mono text-sm")}
          required
        />
      </label>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
          {loading ? 'Creating...' : 'Create via JSON'}
        </Button>
      </div>
    </form>
  );
}

function UpdateProblemForm({ onDone }) {
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
      const res = await axiosClient.get(`/problem/problemById/${problemId}`);
      const data = res.data;
      // Remove fields that shouldn't be edited or are read-only
      const editable = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags,
        visibleTestCases: data.visibleTestCases || [],
        hiddenTestCases: data.hiddenTestCases || [],
        startCode: data.startCode || [],
        referenceSolution: data.referenceSolution || [],
      };
      setEditJson(JSON.stringify(editable, null, 2));
      setEditingId(problemId);
    } catch (err) {
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
        toast.error(err.response?.data?.message || typeof err.response?.data === 'string' ? err.response?.data : 'Failed to update');
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

function VideoProblemForm({ onDone }) {
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
        axiosClient.get('/video/all').catch(() => ({ data: [] })),
      ]);
      setProblems(Array.isArray(problemRes.data) ? problemRes.data : []);
      const videoMap = {};
      (Array.isArray(videoRes.data) ? videoRes.data : []).forEach(v => {
        videoMap[v.problemId] = v;
      });
      setVideos(videoMap);
    } catch (err) {
      toast.error('Failed to load problems');
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

      const uploadRes = await fetch(sig.upload_url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed');
      }
      const cloudData = await uploadRes.json();

      // Step 3: Save metadata to our backend
      await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudData.public_id,
        secureUrl: cloudData.secure_url,
        duration: cloudData.duration || 0,
      });

      toast.success('Video uploaded successfully!');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Upload failed');
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
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Delete failed');
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
                          <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
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
      <main className={cx(ui.layout.page, ui.layout.section)}>
        <div className="text-center mb-10">
          <h1 className={cx(ui.typography.h1, "mb-2")}>Admin Panel</h1>
          <p className="text-slate-400">Manage coding problems on your platform</p>
        </div>

        {!activeForm ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <AdminCard 
              icon={Plus} 
              title="Create Problem" 
              description="Add a new coding problem to the platform" 
              buttonText="Create Problem" 
              color="emerald"
              onClick={() => setActiveForm('create')}
            />
            <AdminCard 
              icon={Edit} 
              title="Update Problem" 
              description="Edit existing problems and their details" 
              buttonText="Update Problem" 
              color="amber"
              onClick={() => setActiveForm('update')}
            />
            <AdminCard 
              icon={Trash2} 
              title="Delete Problem" 
              description="Remove problems from the platform" 
              buttonText="Delete Problem" 
              color="rose"
              onClick={() => setActiveForm('delete')}
            />
            <AdminCard 
              icon={Video} 
              title="Video Problem" 
              description="Upload And Delete Videos" 
              buttonText="Video Problem" 
              color="emerald"
              onClick={() => setActiveForm('video')}
            />
            <AdminCard 
              icon={RefreshCw} 
              title="Import LeetCode" 
              description="Fetch and import problems directly from LeetCode" 
              buttonText="Import LeetCode" 
              color="blue"
              onClick={() => setActiveForm('import')}
            />
          </div>
        ) : (
          <div className={cx(['video', 'delete', 'update'].includes(activeForm) ? 'max-w-4xl' : 'max-w-2xl', 'mx-auto')}>
            <button 
              onClick={() => setActiveForm(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <GlassCard className="p-6">
              {activeForm === 'create' && <CreateProblemForm onDone={() => setActiveForm(null)} />}
              {activeForm === 'update' && <UpdateProblemForm onDone={() => setActiveForm(null)} />}
              {activeForm === 'delete' && <DeleteProblemForm onDone={() => setActiveForm(null)} />}
              {activeForm === 'video' && <VideoProblemForm onDone={() => setActiveForm(null)} />}
              {activeForm === 'import' && <ImportLeetCodeForm onDone={() => setActiveForm(null)} />}
            </GlassCard>
          </div>
        )}
      </main>
    </ProductShell>
  );
}
