/**
 * App.js – Root router with protected routes
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import HomePage    from './pages/HomePage';
import SignupPage  from './pages/SignupPage';
import LoginPage   from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage  from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

/** Redirect authenticated users away from auth pages */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/** Redirect unauthenticated users to login */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)',
    }}>
      <span className="loader" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/signup" element={
        <PublicRoute><SignupPage /></PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
      <Route path="/upload" element={
        <PrivateRoute><UploadPage /></PrivateRoute>
      } />
      <Route path="/results" element={
        <PrivateRoute><ResultsPage /></PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute><HistoryPage /></PrivateRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: 'var(--green)',  secondary: 'var(--bg-card)' } },
            error:   { iconTheme: { primary: 'var(--red)',    secondary: 'var(--bg-card)' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
