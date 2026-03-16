/**
 * Navbar.js – Public-facing navigation bar
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(9,9,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '1rem 1.5rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <span style={{
            background: 'var(--violet)',
            color: '#fff',
            padding: '0.3rem 0.6rem',
            borderRadius: 6,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}>CP</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontSize: '1rem',
          }}>CodeScan <span style={{ color: 'var(--violet-light)' }}>AI</span></span>
        </Link>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/login"  className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
