import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { currentUser, logout, notifications, setNotifications } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
          <div>
            <div className="text-2xl font-bold text-red-600">Donify</div>
            <div className="text-xs text-gray-500">Blood Donation Network</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/requests" className="text-sm text-gray-700 hover:text-red-600 font-medium">Requests</Link>
          <Link to="/donors" className="text-sm text-gray-700 hover:text-red-600 font-medium">Donors</Link>
          <Link to="/blockchain" className="text-sm text-gray-700 hover:text-red-600 font-medium">Records</Link>
        </div>

        <NotificationPanel notifications={notifications} onClear={() => setNotifications([])} />

        <div className="flex items-center space-x-3">
          {!currentUser ? (
            <>
              <Link to="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 font-medium">Login</Link>
              <Link to="/signup" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Sign Up</Link>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.name ? currentUser.name[0] : currentUser.hospitalName?.[0]}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">{currentUser.name || currentUser.hospitalName}</div>
                  <div className="text-xs text-gray-500">{currentUser.role}</div>
                </div>
              </div>
              <Link to={`/${currentUser.role.toLowerCase()}`} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Dashboard</Link>
              <button onClick={handleLogout} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
