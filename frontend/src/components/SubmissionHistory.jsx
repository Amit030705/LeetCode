import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Code2, Eye, Loader2, X, XCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { Button, EmptyState, IconButton, StatusBadge } from './ProductShell';
import { cx, ui } from '../utils/uiHelpers';

function formatMemory(memory = 0) {
  if (!memory) return '--';
  if (memory < 1024) return `${memory} KB`;
  return `${(memory / 1024).toFixed(2)} MB`;
}

function formatRuntime(runtime = 0) {
  if (!runtime) return '--';
  return `${Number(runtime).toFixed(3)}s`;
}

function normalizeStatus(status = '') {
  if (status === 'accepted') return 'Accepted';
  if (status === 'wrong') return 'Wrong Answer';
  if (status === 'error') return 'Runtime Error';
  if (status === 'pending') return 'Pending';
  return status || 'Unknown';
}

function SubmissionHistory({ problemId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch {
        setError('Failed to fetch submission history');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const rows = useMemo(
    () => [...submissions].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [submissions],
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading submissions
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm font-medium text-red-200">{error}</div>;
  }

  return (
    <div>
      {!rows.length ? (
        <EmptyState
          icon={Code2}
          title="No submissions yet"
          description="Submit a solution to start building your history for this problem."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-slate-950/50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Runtime</th>
                <th className="px-4 py-3">Memory</th>
                <th className="px-4 py-3">Tests</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rows.map((submission) => (
                <tr key={submission._id} className="transition hover:bg-blue-500/[0.05]">
                  <td className="px-4 py-4">
                    <StatusBadge status={submission.status}>
                      {submission.status === 'accepted' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {normalizeStatus(submission.status)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-slate-300">{submission.language}</td>
                  <td className="px-4 py-4 font-mono text-sm text-slate-300">{formatRuntime(submission.runtime)}</td>
                  <td className="px-4 py-4 font-mono text-sm text-slate-300">{formatMemory(submission.memory)}</td>
                  <td className="px-4 py-4 font-mono text-sm text-slate-300">
                    {submission.testCasesPassed || 0}/{submission.testCasesTotal || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '--'}
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="ghost" onClick={() => setSelectedSubmission(submission)} className="h-8 px-2.5">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/82 p-4 backdrop-blur-xl">
          <div className={cx(ui.card, 'max-h-[88vh] w-full max-w-5xl overflow-hidden')}>
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h3 className={ui.typography.h2}>Submission Code</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedSubmission.language}</p>
              </div>
              <IconButton onClick={() => setSelectedSubmission(null)} aria-label="Close submission code">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <pre className="max-h-[66vh] overflow-auto p-4 text-sm leading-7 text-slate-200">
              <code>{selectedSubmission.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionHistory;
