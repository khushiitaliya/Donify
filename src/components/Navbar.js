import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { currentUser, logout, notifications, setNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const normalizedRole = (currentUser?.role || '').toLowerCase();

  const navLinks = currentUser
    ? [
        { label: 'Home', to: '/' },
        { label: 'Blood Requests', to: '/requests' },
        ...(normalizedRole === 'hospital' || normalizedRole === 'admin'
          ? [{ label: 'Donors', to: '/donors' }]
          : []),
        { label: 'Records', to: '/blockchain' },
      ]
    : [{ label: 'Home', to: '/' }];

  const isActive = (to) => location.pathname === to;

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg">
      {/* Top Bar */}
      <div className="bg-[#1a1a2e] text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-rose-700 text-xl font-black shadow-lg shadow-red-950/50">
              D
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight leading-none">
                Donify
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">Blood Response Network</div>
            </div>
          </Link>

          {/* Right side auth / user */}
          <div className="flex items-center gap-3">
            <NotificationPanel notifications={notifications} onClear={() => setNotifications([])} />

            {!currentUser ? (
              <>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow hover:opacity-90 transition"
                >
                  &#128100; Register
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-md border-2 border-white/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:border-orange-400 hover:text-orange-300 transition"
                >
                  &#128274; Login
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">
                    {(currentUser.name || currentUser.hospitalName || 'U')[0]}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold leading-none">{currentUser.name || currentUser.hospitalName}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">{currentUser.role}</div>
                  </div>
                </div>
                <Link
                  to={`/${currentUser.role.toLowerCase()}`}
                  className="rounded-md bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white/80 hover:border-red-400 hover:text-red-300 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500">
        <div className="mx-auto flex w-full max-w-7xl items-center px-5 md:px-8">
          <nav className="flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-5 py-3.5 text-sm font-bold uppercase tracking-widest transition border-b-4 ${
                  isActive(link.to)
                    ? 'border-white text-white'
                    : 'border-transparent text-white/80 hover:border-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

