/**
 * HistoryPage.js – List all past analyses with delete option
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getHistory, deleteAnalysis } from '../services/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getHistory()
      .then(r => setHistory(r.data.history || []))
      .catch(() => toast.error('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis record?')) return;
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      setHistory(prev => prev.filter(a => a.analysis_id !== id));
      toast.success('Deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (analysis) => {
    navigate('/results', { state: { result: analysis.result } });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span className="glow-dot" style={{ display: 'inline-block', width: 6, height: 6, marginRight: 6 }} />
            History
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>Analysis History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            {history.length} past {history.length === 1 ? 'analysis' : 'analyses'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◈</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No analyses yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload your first set of code files to get started.
            </p>
            <button onClick={() => navigate('/upload')} className="btn btn-primary">
              ⬆ Upload Files
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Files</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Verdict</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a, idx) => {
                  const score = a.similarity_score;
                  const [label, cls] =
                    score >= 80 ? ['HIGH PLAGIARISM', 'badge-high'] :
                    score >= 50 ? ['MODERATE',        'badge-medium'] :
                    score >= 20 ? ['LOW SIMILARITY',  'badge-low'] :
                                  ['ORIGINAL',        'badge-clean'];
                  return (
                    <tr key={a.analysis_id}>
                      <td style={{ color: 'var(--text-muted)', width: 40 }}>{idx + 1}</td>
                      <td>
                        <div style={{ maxWidth: 200 }}>
                          {(a.file_names || []).map(n => (
                            <div key={n} style={{
                              fontSize: '0.8rem', color: 'var(--text-secondary)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{n}</div>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.language || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ width: 64 }}>
                            <div className="progress-fill" style={{
                              width: `${score}%`,
                              background: score >= 80 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--green)',
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{score}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(a.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleView(a)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(a.analysis_id)}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            disabled={deleting === a.analysis_id}
                          >
                            {deleting === a.analysis_id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
