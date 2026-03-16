/**
 * DashboardPage.js – Post-login welcome dashboard
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getHistory } from '../services/api';

function StatCard({ label, value, color = 'var(--violet-light)', icon }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}22`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.75rem', color, lineHeight: 1,
        }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAnalyses = history.length;
  const avgScore = totalAnalyses
    ? (history.reduce((s, a) => s + a.similarity_score, 0) / totalAnalyses).toFixed(1)
    : 0;
  const highRisk = history.filter(a => a.similarity_score >= 80).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--text-muted)', fontSize: '0.8rem',
            marginBottom: '0.5rem',
          }}>
            <span className="glow-dot" style={{ width: 6, height: 6 }} />
            Dashboard
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>
            Welcome back, <span style={{ color: 'var(--violet-light)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Here's your plagiarism detection overview.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          <StatCard icon="◈" label="Total Analyses"  value={totalAnalyses} color="var(--violet-light)" />
          <StatCard icon="⬡" label="Avg Similarity"  value={`${avgScore}%`} color="var(--amber)" />
          <StatCard icon="⚑" label="High-Risk Files" value={highRisk} color="var(--red)" />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/upload" className="card" style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            textDecoration: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--bg-card), rgba(138,43,226,0.08))',
            border: '1px solid var(--border-strong)',
          }}>
            <div style={{ fontSize: '2rem' }}>⬆</div>
            <h3 style={{ color: 'var(--violet-light)' }}>Upload & Analyze</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Upload code files and run an instant plagiarism check.
            </p>
            <span style={{ color: 'var(--violet-light)', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Start →
            </span>
          </Link>

          <Link to="/history" className="card" style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            textDecoration: 'none', cursor: 'pointer',
          }}>
            <div style={{ fontSize: '2rem' }}>◈</div>
            <h3>View History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Browse past analyses and download reports.
            </p>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Browse →
            </span>
          </Link>
        </div>

        {/* Recent analyses */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Analyses</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <span className="loader" />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No analyses yet.{' '}
              <Link to="/upload">Upload your first files →</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Files</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map(a => {
                  const score = a.similarity_score;
                  const verdict =
                    score >= 80 ? ['HIGH PLAGIARISM', 'badge-high'] :
                    score >= 50 ? ['MODERATE', 'badge-medium'] :
                    score >= 20 ? ['LOW SIMILARITY', 'badge-low'] :
                                  ['ORIGINAL', 'badge-clean'];
                  return (
                    <tr key={a.analysis_id}>
                      <td>{(a.file_names || []).join(', ')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.language || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{
                              width: `${score}%`,
                              background: score >= 80 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--green)',
                            }} />
                          </div>
                          <span>{score}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td><span className={`badge ${verdict[1]}`}>{verdict[0]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
