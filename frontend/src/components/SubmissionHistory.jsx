import { useState, useEffect } from 'react';
import { CheckCircle2, Code2, Loader2, X, XCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusStyle = (status = '') => {
    switch (status) {
      case 'accepted': return 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300';
      case 'wrong': return 'border-red-300/20 bg-red-400/10 text-red-300';
      case 'error': return 'border-amber-300/20 bg-amber-400/10 text-amber-300';
      case 'pending': return 'border-cyan-300/20 bg-cyan-400/10 text-cyan-300';
      default: return 'border-slate-300/20 bg-slate-400/10 text-slate-300';
    }
  };

  const formatMemory = (memory = 0) => {
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading submissions
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-5 text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <Code2 className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 font-black text-white">No submissions yet</p>
          <p className="mt-1 text-sm text-slate-500">Run and submit your first solution to build history.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4">Status</th>
                <th className="px-4">Language</th>
                <th className="px-4">Runtime</th>
                <th className="px-4">Memory</th>
                <th className="px-4">Tests</th>
                <th className="px-4">Submitted</th>
                <th className="px-4">Code</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.035] px-4 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(sub.status)}`}>
                      {sub.status === 'accepted' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 font-mono text-slate-300">{sub.language}</td>
                  <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 font-mono text-slate-300">{sub.runtime}s</td>
                  <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 font-mono text-slate-300">{formatMemory(sub.memory)}</td>
                  <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 font-mono text-slate-300">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                  <td className="border-y border-white/10 bg-white/[0.035] px-4 py-4 text-sm text-slate-400">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.035] px-4 py-4">
                    <button onClick={() => setSelectedSubmission(sub)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-xl">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="text-xl font-black text-white">Submission Code</h3>
                <p className="text-sm text-slate-500">{selectedSubmission.language}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="max-h-[66vh] overflow-auto p-5 text-sm leading-7 text-slate-200">
              <code>{selectedSubmission.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
