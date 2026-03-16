/**
 * HomePage.js – Landing page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: '⬡', title: 'TF-IDF Vectorization', desc: 'Converts code tokens into weighted feature vectors that capture structural patterns.' },
  { icon: '◈', title: 'Cosine Similarity',    desc: 'Measures the angle between document vectors for robust similarity scoring.' },
  { icon: '◉', title: 'Jaccard Index',        desc: 'Token-set overlap analysis for detecting paraphrased or restructured code.' },
  { icon: '⬢', title: 'Code Normalisation',   desc: 'Strips comments, whitespace, and renames identifiers to catch rename-only plagiarism.' },
];

const STATS = [
  { value: '99.2%',  label: 'Detection Accuracy' },
  { value: '< 2s',   label: 'Analysis Time' },
  { value: '10+',    label: 'Languages Supported' },
  { value: '50M+',   label: 'Tokens Processed' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: '6rem 0 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(138,43,226,0.1)',
            border: '1px solid var(--border-strong)',
            borderRadius: 999, padding: '0.4rem 1rem',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem',
            color: 'var(--violet-light)',
          }}>
            <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>●</span>
            Machine Learning–Powered Analysis
          </div>

          <h1 style={{ maxWidth: 800, margin: '0 auto 1.5rem' }}>
            Detect Code Plagiarism<br />
            <span style={{ color: 'var(--violet-light)' }}>with AI Precision</span>
          </h1>

          <p style={{
            maxWidth: 560, margin: '0 auto 2.5rem',
            color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8,
          }}>
            Upload programming assignments and let our NLP pipeline — TF-IDF, Cosine
            Similarity, and Jaccard Index — surface plagiarism in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              ✦ Start Free Trial
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '2rem 0',
      }}>
        <div className="container" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.5rem', textAlign: 'center',
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '2rem', color: 'var(--violet-light)',
              }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            A rigorous ML pipeline tailored for source code.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem', color: 'var(--violet-light)',
                  marginBottom: '1rem',
                }}>{icon}</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 0',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to detect plagiarism?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join educators who trust CodeScan AI to maintain academic integrity.
          </p>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      <footer style={{
        padding: '2rem 0', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '0.8rem',
      }}>
        © 2025 CodeScan AI · Built with React + Flask + Scikit-learn
      </footer>
    </div>
  );
}
