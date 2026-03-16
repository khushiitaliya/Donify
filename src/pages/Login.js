import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Redirect based on role
    const role = result.user.role.toLowerCase();
    navigate(`/${role}`);
  };

  const fillDemoAccount = (type) => {
    if (type === 'donor') {
      setEmail('john@example.com');
      setPassword('donor123');
    } else if (type === 'hospital') {
      setEmail('city@hospital.com');
      setPassword('hosp123');
    } else if (type === 'admin') {
      setEmail('admin@donify.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-13rem)] gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <section className="page-hero flex flex-col justify-between">
        <div className="relative z-10 space-y-6">
          <span className="blood-pill bg-white/12 text-white">Access Portal</span>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Coordinate urgent blood response from one secure login.</h1>
          <p className="max-w-xl text-sm leading-7 text-white/78 md:text-base">
            Sign in as donor, hospital, or admin to review active requests, donor readiness, and communication history.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Donor Demo</div>
              <div className="mt-2 text-lg font-bold">john@example.com</div>
            </div>
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Hospital Demo</div>
              <div className="mt-2 text-lg font-bold">city@hospital.com</div>
            </div>
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Admin Demo</div>
              <div className="mt-2 text-lg font-bold">admin@donify.com</div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-6 shadow-2xl shadow-red-950/10 md:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-700 text-3xl font-black text-white shadow-lg shadow-red-200">
            D
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage donations, alerts, and records.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-shell"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-shell"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="action-primary w-full disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mb-6 rounded-[26px] bg-slate-900 px-4 py-5 text-white">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.22em] text-white/55">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemoAccount('donor')}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-semibold hover:bg-white/10"
            >
              Donor Demo
            </button>
            <button
              onClick={() => fillDemoAccount('hospital')}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-semibold hover:bg-white/10"
            >
              Hospital Demo
            </button>
            <button
              onClick={() => fillDemoAccount('admin')}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-semibold hover:bg-white/10"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="border-t border-red-100 pt-6 text-center">
          <p className="text-slate-600">Don't have an account?</p>
          <Link to="/signup" className="font-bold text-red-700 hover:underline">
            Sign Up Here
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
