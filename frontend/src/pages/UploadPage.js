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
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>
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

    files.forEach(f => {
      formData.append('files', f);
    });

    if (language !== 'Auto-detect') {
      formData.append('language', language);
    }

    setLoading(true);
    setProgress(0);

    try {
      const { data } = await uploadFiles(formData, setProgress);

      toast.success('Analysis complete!');
      navigate('/results', { state: { result: data.result } });

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        'Upload failed. Please try again.';

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content fade-in">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Upload Files
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>Upload Code Files</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Upload 2 or more code files to compare for plagiarism.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

          {/* LEFT: Dropzone */}
          <div>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#8a2be2' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-card)'
              }}
            >
              <input {...getInputProps()} />
              <div style={{ fontSize: '2.5rem' }}>⬆</div>
              <h3>{isDragActive ? 'Drop files here' : 'Drag & drop code files'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                or click to browse — .py, .java, .js, .cpp, .c and more
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{files.length} files selected</span>
                  <button onClick={() => setFiles([])}>Clear</button>
                </div>

                {files.map(f => (
                  <FileItem key={f.name} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Analysis Settings */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3>Analysis Settings</h3>

            {/* Language */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PROGRAMMING LANGUAGE
              </label>

              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Algorithms */}
            <div style={{
              marginTop: '1rem',
              background: 'var(--bg-surface)',
              padding: '0.8rem',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Algorithms Used
              </div>

              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                <li>✔ TF-IDF Vectorization</li>
                <li>✔ Cosine Similarity</li>
                <li>✔ Jaccard Index</li>
                <li>✔ Token Normalisation</li>
              </ul>
            </div>

            {/* Progress */}
            {loading && (
              <div style={{ marginTop: '1rem' }}>
                <p>{progress}%</p>
                <div style={{ height: '6px', background: '#333', borderRadius: '6px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#8a2be2' }} />
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || files.length < 2}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.7rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6a0dad, #8a2be2)',
                color: '#fff',
                border: 'none'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>

            <p style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '0.5rem' }}>
              Need at least 2 files
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
