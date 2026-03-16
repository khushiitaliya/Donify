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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            D
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Donify</h1>
          <p className="text-gray-600 mt-2">Blood Donation Network</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mb-6">
          <p className="text-xs text-gray-600 text-center mb-3">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemoAccount('donor')}
              className="text-xs p-2 border-2 border-gray-300 rounded hover:bg-gray-50 font-semibold"
            >
              Donor Demo
            </button>
            <button
              onClick={() => fillDemoAccount('hospital')}
              className="text-xs p-2 border-2 border-gray-300 rounded hover:bg-gray-50 font-semibold"
            >
              Hospital Demo
            </button>
            <button
              onClick={() => fillDemoAccount('admin')}
              className="text-xs p-2 border-2 border-gray-300 rounded hover:bg-gray-50 font-semibold"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="border-t pt-6 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/signup" className="text-red-600 font-bold hover:underline">
            Sign Up Here
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
