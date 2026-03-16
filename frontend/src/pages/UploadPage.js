/**
 * UploadPage.js – Drag-and-drop multi-file upload + analysis
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Sidebar from '../components/Sidebar';
import { uploadFiles } from '../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = ['Auto-detect', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Ruby', 'Go', 'PHP'];

const ALLOWED_EXT = ['.py', '.java', '.js', '.ts', '.c', '.cpp', '.cs', '.rb', '.go', '.php', '.swift', '.kt', '.rs', '.txt'];

function FileItem({ file, onRemove }) {
  const ext = file.name.split('.').pop().toLowerCase();
  const icons = { py: '🐍', java: '☕', js: '𝙅𝙎', ts: '𝙏𝙎', c: '🔵', cpp: '🔷', cs: '💜', rb: '💎', go: '🐹', php: '🐘' };
  const icon = icons[ext] || '📄';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {(file.size / 1024).toFixed(1)} KB
        </div>
      </div>
      <button onClick={() => onRemove(file.name)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0.2rem' }}>
        ✕
      </button>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('Auto-detect');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted) => {
    const valid = accepted.filter(f =>
      ALLOWED_EXT.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    if (valid.length < accepted.length) {
      toast.error('Some files were skipped (unsupported type).');
    }
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { 'text/*': ALLOWED_EXT },
  });

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleSubmit = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 files to compare.');
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (language !== 'Auto-detect') formData.append('language', language);

    setLoading(true);
    setProgress(0);

    try {
      const { data } = await uploadFiles(formData, setProgress);
      toast.success('Analysis complete!');
      navigate('/results', { state: { result: data.result } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span className="glow-dot" style={{ display: 'inline-block', width: 6, height: 6, marginRight: 6 }} />
            Upload Files
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>Upload Code Files</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Upload 2 or more code files to compare for plagiarism.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Drop zone */}
          <div>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--violet)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? 'rgba(138,43,226,0.05)' : 'var(--bg-card)',
                transition: 'all 0.2s ease',
                marginBottom: '1rem',
              }}
            >
              <input {...getInputProps()} />
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬆</div>
              <h3 style={{ marginBottom: '0.5rem', color: isDragActive ? 'var(--violet-light)' : 'var(--text-primary)' }}>
                {isDragActive ? 'Drop files here' : 'Drag & drop code files'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                or click to browse — .py, .java, .js, .cpp, .c and more
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </span>
                  <button onClick={() => setFiles([])}
                    className="btn btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                    Clear all
                  </button>
                </div>
                {files.map(f => (
                  <FileItem key={f.name} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>

          {/* Settings panel */}
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Analysis Settings</h3>

            <div className="form-group">
              <label>Programming Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div style={{
              padding: '0.75rem', background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Algorithms Used
              </div>
              {['TF-IDF Vectorization', 'Cosine Similarity', 'Jaccard Index', 'Token Normalisation'].map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {a}
                </div>
              ))}
            </div>

            {/* Progress bar (visible during upload) */}
            {loading && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>Analyzing…</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${progress}%`,
                    background: 'var(--violet)',
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              disabled={loading || files.length < 2}
            >
              {loading
                ? <><span className="loader" style={{ width: 16, height: 16 }} /> Analyzing…</>
                : `⬡ Analyze ${files.length > 0 ? `${files.length} Files` : ''}`}
            </button>

            {files.length < 2 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Need at least 2 files
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
