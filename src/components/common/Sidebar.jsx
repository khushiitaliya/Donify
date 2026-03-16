import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const MENU_ITEMS = {
  donor: [
    { label: 'Dashboard', path: '/donor/dashboard', icon: '📊' },
    { label: 'Blood Requests', path: '/donor/requests', icon: '🩸' },
    { label: 'Donation History', path: '/donor/donations', icon: '📋' },
    { label: 'Health Tracking', path: '/donor/health', icon: '❤️' },
    { label: 'Eligibility', path: '/donor/eligibility', icon: '✓' },
    { label: 'Profile', path: '/donor/profile', icon: '👤' },
  ],
  hospital: [
    { label: 'Dashboard', path: '/hospital/dashboard', icon: '📊' },
    { label: 'Create Request', path: '/hospital/create', icon: '➕' },
    { label: 'Manage Requests', path: '/hospital/requests', icon: '🩸' },
    { label: 'Blood Inventory', path: '/hospital/inventory', icon: '📦' },
    { label: 'Donor Directory', path: '/hospital/donors', icon: '👥' },
    { label: 'Analytics', path: '/hospital/analytics', icon: '📈' },
    { label: 'Profile', path: '/hospital/profile', icon: '🏥' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { label: 'Donors', path: '/admin/donors', icon: '👥' },
    { label: 'Hospitals', path: '/admin/hospitals', icon: '🏥' },
    { label: 'Verify Donors', path: '/admin/verify-donors', icon: '✓' },
    { label: 'Verify Hospitals', path: '/admin/verify-hospitals', icon: '✓' },
    { label: 'Requests', path: '/admin/requests', icon: '🩸' },
    { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📝' },
  ],
};

export default function Sidebar({ userType }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const items = MENU_ITEMS[userType] || [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        className="lg:hidden fixed top-20 left-4 z-40 bg-blood-red text-white p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <div
        className={`fixed lg:relative lg:translate-x-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } left-0 top-0 w-64 h-screen bg-gray-900 text-white pt-20 lg:pt-0 z-30`}
      >
        <div className="p-6 space-y-4">
          <nav className="space-y-2">
            {items.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  isActive(item.path)
                    ? 'bg-blood-red text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 top-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
