import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiHeart, FiDroplet } from 'react-icons/fi';
import Button from '../common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('donor');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(email, password, userType);
    if (result.success) {
      navigate(`/${userType}/dashboard`);
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blood-red to-pink-500 rounded-full opacity-10 -ml-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 -mr-48 -mb-48"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blood-red to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
              D
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <FiHeart className="text-white text-sm animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donify</h1>
          <p className="text-gray-600 text-lg">Blood Donation Platform</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <FiDroplet className="text-blood-red" />
            <span className="text-sm text-gray-500">Save Lives, Donate Blood</span>
            <FiDroplet className="text-blood-red" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">I am a:</label>
            <div className="grid grid-cols-3 gap-3">
              {['donor', 'hospital', 'admin'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`py-3 px-4 rounded-xl capitalize font-semibold transition-all duration-300 transform hover:scale-105 ${
                    userType === type
                      ? 'bg-gradient-to-r from-blood-red to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {type === 'donor' && '🩸'}
                  {type === 'hospital' && '🏥'}
                  {type === 'admin' && '👤'}
                  <span className="ml-2">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="text-gray-400 text-lg" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 text-lg" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-2 font-medium">{errors.password}</p>}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl">
              <p className="font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Login Button */}
          <Button 
            variant="primary" 
            size="lg" 
            loading={loading} 
            className="w-full bg-gradient-to-r from-blood-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <FiHeart className="mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-blood-red font-bold hover:underline transition">
                Sign up now
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <Link to="#" className="hover:text-blood-red transition">Forgot Password?</Link>
              <span>•</span>
              <Link to="#" className="hover:text-blood-red transition">Help Center</Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <FiHeart className="text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <FiDroplet className="text-blue-500" />
              <span>Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🏆</span>
              <span>Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
