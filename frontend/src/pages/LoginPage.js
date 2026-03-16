/**
 * LoginPage.js – User authentication
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())   e.email    = 'Email is required';
    if (!form.password)       e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '2rem',
    }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, background: 'var(--violet)',
            borderRadius: 14, fontSize: '1.5rem', marginBottom: '1rem',
            boxShadow: '0 0 30px var(--violet-glow)',
          }}>⬡</div>
          <h2>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup">Sign up →</Link>
          </p>
        </div>

        <div className="card fade-in">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                style={errors.email ? { borderColor: 'var(--red)' } : {}}
              />
              {errors.email && <span style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password" type="password" placeholder="Your password"
                value={form.password} onChange={handleChange}
                style={errors.password ? { borderColor: 'var(--red)' } : {}}
              />
              {errors.password && <span style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <button
              type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? <><span className="loader" style={{ width: 16, height: 16 }} /> Signing in…</> : '→ Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
