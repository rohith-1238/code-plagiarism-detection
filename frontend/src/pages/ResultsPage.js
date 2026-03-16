/**
 * ResultsPage.js – Displays analysis results: score ring, heatmap,
 * pairwise comparison table, matching code segments, and download report.
 */

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import ScoreRing from '../components/ScoreRing';

/* ── Helpers ───────────────────────────────────────────────── */
function verdictBadge(score) {
  if (score >= 80) return ['HIGH PLAGIARISM', 'badge-high'];
  if (score >= 50) return ['MODERATE',        'badge-medium'];
  if (score >= 20) return ['LOW SIMILARITY',  'badge-low'];
  return             ['ORIGINAL',             'badge-clean'];
}

function heatColor(score) {
  if (score >= 80) return 'rgba(239,68,68,';
  if (score >= 50) return 'rgba(245,158,11,';
  if (score >= 20) return 'rgba(59,130,246,';
  return                  'rgba(16,185,129,';
}

/* ── Sub-components ────────────────────────────────────────── */
function SimilarityHeatmap({ matrix, fileNames }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1rem' }}>Similarity Heatmap</h3>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
        <thead>
          <tr>
            <th style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }} />
            {fileNames.map(n => (
              <th key={n} style={{
                padding: '0.5rem 0.75rem', fontSize: '0.75rem',
                color: 'var(--text-secondary)', fontFamily: 'var(--font-display)',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td style={{
                padding: '0.5rem 0.75rem', fontSize: '0.75rem',
                color: 'var(--text-secondary)', fontFamily: 'var(--font-display)',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{fileNames[i]}</td>
              {row.map((val, j) => {
                const alpha = i === j ? 0.15 : val / 100 * 0.7 + 0.05;
                return (
                  <td key={j} style={{
                    padding: '0.75rem 1rem',
                    background: `${heatColor(val)}${alpha.toFixed(2)})`,
                    borderRadius: 6, textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.875rem',
                    color: val >= 50 ? '#fff' : 'var(--text-primary)',
                    minWidth: 70,
                  }}>
                    {i === j ? '—' : `${val}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PairCard({ pair, index }) {
  const [open, setOpen] = useState(false);
  const [label, cls] = verdictBadge(pair.combined_score);

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          color: 'var(--text-muted)', fontSize: '0.75rem', width: 28,
        }}>#{index + 1}</div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {pair.file1}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>vs</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {pair.file2}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--violet-light)' }}>
            {pair.combined_score}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>combined</div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--amber)' }}>{pair.cosine_similarity}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>cosine</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--blue)' }}>{pair.jaccard_similarity}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>jaccard</div>
          </div>
        </div>

        <span className={`badge ${cls}`}>{label}</span>

        <button
          onClick={() => setOpen(o => !o)}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
        >
          {open ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
        <div className="progress-fill" style={{
          width: `${pair.combined_score}%`,
          background: pair.combined_score >= 80 ? 'var(--red)' :
                      pair.combined_score >= 50 ? 'var(--amber)' : 'var(--green)',
        }} />
      </div>

      {/* Matching segments */}
      {open && pair.matching_segments?.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '0.8rem', color: 'var(--text-muted)',
            marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Top Matching Segments ({pair.matching_segments.length})
          </div>
          {pair.matching_segments.slice(0, 5).map((seg, i) => (
            <div key={i} style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 700 }}>
                  Match #{i + 1}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {seg.length} tokens
                </span>
              </div>
              <code style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {seg.segment.length > 200 ? seg.segment.slice(0, 200) + '…' : seg.segment}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function ResultsPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const result    = state?.result;

  if (!result) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No results found.</p>
            <Link to="/upload" className="btn btn-primary">Upload Files</Link>
          </div>
        </main>
      </div>
    );
  }

  const radarData = result.pairs?.slice(0, 6).map(p => ({
    pair: `${p.file1.split('.')[0]} vs ${p.file2.split('.')[0]}`,
    Cosine: p.cosine_similarity,
    Jaccard: p.jaccard_similarity,
  })) || [];

  const handleDownload = () => {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `plagiarism_report_${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              Analysis Results
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>Plagiarism Report</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.875rem' }}>
              {result.file_names?.length} files · {result.language}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownload} className="btn btn-secondary">⬇ Download JSON</button>
            <button onClick={() => navigate('/upload')} className="btn btn-primary">⬆ New Analysis</button>
          </div>
        </div>

        {/* Overall score + verdict */}
        <div className="card" style={{
          display: 'flex', alignItems: 'center', gap: '2rem',
          flexWrap: 'wrap', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-card), rgba(138,43,226,0.07))',
          border: '1px solid var(--border-strong)',
        }}>
          <ScoreRing score={result.overall_score} size={140} strokeWidth={12} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Overall Highest Similarity
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{result.overall_score}%</h2>
              <span className={`badge ${verdictBadge(result.overall_score)[1]}`} style={{ fontSize: '0.85rem', padding: '0.3rem 1rem' }}>
                {verdictBadge(result.overall_score)[0]}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                ['Files Compared', result.file_names?.length],
                ['Pairs Analyzed', result.pairs?.length],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        {result.similarity_matrix && (
          <SimilarityHeatmap matrix={result.similarity_matrix} fileNames={result.file_names} />
        )}

        {/* Radar chart */}
        {radarData.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Algorithm Comparison (Radar)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="pair" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name="Cosine"  dataKey="Cosine"  stroke="var(--violet-light)" fill="var(--violet-light)" fillOpacity={0.25} />
                <Radar name="Jaccard" dataKey="Jaccard" stroke="var(--amber)"         fill="var(--amber)"         fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              {[['Cosine Similarity', 'var(--violet-light)'], ['Jaccard Similarity', 'var(--amber)']].map(([lbl, clr]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: clr, display: 'inline-block' }} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pairwise results */}
        <h3 style={{ marginBottom: '1rem' }}>
          Pairwise Comparison ({result.pairs?.length} pair{result.pairs?.length !== 1 ? 's' : ''})
        </h3>
        {result.pairs?.map((pair, i) => (
          <PairCard key={i} pair={pair} index={i} />
        ))}

      </main>
    </div>
  );
}
