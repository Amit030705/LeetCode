import React, { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { Search, Download, CheckCircle, AlertCircle } from 'lucide-react';

function LeetCodeImport() {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFetch = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setProblem(null);
    try {
      const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');
      const { data } = await axiosClient.get(`/problem/fetch-leetcode/${normalizedSlug}`);
      setProblem(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch problem');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!problem) return;
    setLoading(true);
    
    // Map tags to match backend enum
    const tagMapping = {
      'array': 'array',
      'string': 'array', // mapping string to array for simplicity if not exists
      'linked-list': 'linkedList',
      'graph': 'graph',
      'dynamic-programming': 'dp',
      'dp': 'dp'
    };

    const firstTag = problem.tags[0] || 'array';
    const mappedTag = tagMapping[firstTag] || 'array';

    // Construct the payload matching AdminPanel requirements
    const payload = {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty, // already lowered in controller
      tags: mappedTag,
      visibleTestCases: [
        {
          input: problem.sampleTestCase || '[]',
          output: 'TODO',
          explanation: 'Imported from LeetCode. Please update the expected output.'
        }
      ],
      hiddenTestCases: [
        {
          input: problem.sampleTestCase || '[]',
          output: 'TODO'
        }
      ],
      startCode: [
        { 
          language: 'C++', 
          initialCode: problem.codeSnippets.find(s => s.langSlug === 'cpp')?.code || '// C++ starter code' 
        },
        { 
          language: 'Java', 
          initialCode: problem.codeSnippets.find(s => s.langSlug === 'java')?.code || '// Java starter code' 
        },
        { 
          language: 'JavaScript', 
          initialCode: problem.codeSnippets.find(s => s.langSlug === 'javascript')?.code || '// JS starter code' 
        }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '// TODO: Add solution' },
        { language: 'Java', completeCode: '// TODO: Add solution' },
        { language: 'JavaScript', completeCode: '// TODO: Add solution' }
      ]
    };

    try {
      await axiosClient.post('/problem/create', payload);
      alert('Problem imported successfully! Please edit it to add correct test cases and solutions.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold">Import from LeetCode</h1>
      </div>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex gap-2">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="Enter LeetCode slug (e.g., two-sum)"
                className="input input-bordered w-full"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
            </div>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleFetch}
              disabled={loading}
            >
              <Search size={20} className="mr-2" />
              Fetch
            </button>
          </div>
          {error && (
            <div className="alert alert-error mt-4 py-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {problem && (
        <div className="card bg-base-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card-body">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="card-title text-2xl">{problem.title}</h2>
                <div className="flex gap-2 mt-2">
                  <div className={`badge ${
                    problem.difficulty === 'easy' ? 'badge-success' : 
                    problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </div>
                  {problem.tags.slice(0, 3).map(tag => (
                    <div key={tag} className="badge badge-outline">{tag}</div>
                  ))}
                </div>
              </div>
              <button 
                className={`btn btn-success ${loading ? 'loading' : ''}`}
                onClick={handleImport}
                disabled={loading}
              >
                <Download size={20} className="mr-2" />
                Import into Database
              </button>
            </div>

            <div className="divider">Description Preview</div>
            <div 
              className="prose max-w-none bg-base-200 p-4 rounded-lg max-h-60 overflow-y-auto mb-4"
              dangerouslySetInnerHTML={{ __html: problem.description }}
            />

            <div className="divider">Sample Test Case</div>
            <pre className="bg-base-300 p-4 rounded-lg font-mono text-sm">
              {problem.sampleTestCase || 'No sample test case found'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeetCodeImport;
