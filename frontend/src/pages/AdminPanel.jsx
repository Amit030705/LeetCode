import { useState } from 'react';
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
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      toast.success('Problem deleted successfully');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Delete Problem</h3>
      <label className="block">
        <span className="block text-sm font-medium text-slate-400 mb-1">Problem ID</span>
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          className={cx(ui.input, "w-full")}
          placeholder="Enter problem ID to delete"
          required
        />
      </label>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white">
          {loading ? 'Deleting...' : 'Delete Permanently'}
        </Button>
      </div>
    </form>
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
  const [id, setId] = useState('');
  const [json, setJson] = useState('{\n  "title": "Updated Title"\n}');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      const payload = JSON.parse(json);
      await axiosClient.put(`/problem/update/${id}`, payload);
      toast.success('Problem updated successfully');
      onDone();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update problem');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Update Problem (Raw JSON)</h3>
      <label className="block">
        <span className="block text-sm font-medium text-slate-400 mb-1">Problem ID</span>
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          className={cx(ui.input, "w-full mb-4")}
          placeholder="Enter problem ID to update"
          required
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-slate-400 mb-1">Update Payload (JSON)</span>
        <textarea 
          value={json} 
          onChange={(e) => setJson(e.target.value)} 
          className={cx(ui.input, "w-full h-48 font-mono text-sm")}
          required
        />
      </label>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500 text-white">
          {loading ? 'Updating...' : 'Update via JSON'}
        </Button>
      </div>
    </form>
  );
}

function VideoProblemForm({ onDone }) {
  const [id, setId] = useState('');
  const [action, setAction] = useState('create');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      if (action === 'create') {
        // Just demonstrating fetching signature, since actual upload is complex
        const res = await axiosClient.get(`/video/create/${id}`);
        toast.success(`Signature fetched: ${res.data.signature.substring(0, 10)}...`);
      } else {
        await axiosClient.delete(`/video/delete/${id}`);
        toast.success('Video deleted successfully');
      }
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Manage Video Solution</h3>
      <label className="block">
        <span className="block text-sm font-medium text-slate-400 mb-1">Problem ID</span>
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          className={cx(ui.input, "w-full mb-4")}
          placeholder="Enter problem ID"
          required
        />
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="create" checked={action === 'create'} onChange={() => setAction('create')} />
          Create/Upload
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="delete" checked={action === 'delete'} onChange={() => setAction('delete')} />
          Delete
        </label>
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
          {loading ? 'Processing...' : 'Execute'}
        </Button>
      </div>
    </form>
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
          <div className="max-w-2xl mx-auto">
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
