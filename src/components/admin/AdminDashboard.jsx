import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiActivity, FiTrendingUp, FiAlertTriangle, FiArrowRight, FiHeart, FiSettings, FiShield, FiDatabase, FiBarChart2, FiClock } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Button from '../common/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    totalDonors: 1250,
    totalHospitals: 45,
    activeRequests: 23,
    completedDonations: 890,
    livesSaved: 2670,
    systemHealth: 98,
  });
  const [recentActivity] = useState([
    {
      id: 1,
      type: 'new_donor',
      user: 'John Smith',
      action: 'Registered as donor',
      time: '5 minutes ago',
      icon: '👤',
    },
    {
      id: 2,
      type: 'blood_request',
      user: 'City Hospital',
      action: 'Created emergency request for O+ blood',
      time: '15 minutes ago',
      icon: '🩸',
    },
    {
      id: 3,
      type: 'donation_completed',
      user: 'Sarah Johnson',
      action: 'Completed blood donation',
      time: '1 hour ago',
      icon: '✅',
    },
    {
      id: 4,
      type: 'hospital_verified',
      user: 'Memorial Hospital',
      action: 'Hospital verification completed',
      time: '2 hours ago',
      icon: '🏥',
    },
  ]);
  const [alerts] = useState([
    {
      id: 1,
      type: 'critical',
      message: 'Low O- blood supply in Central Region',
      time: '30 minutes ago',
      count: 3,
    },
    {
      id: 2,
      type: 'warning',
      message: '3 hospitals pending verification',
      time: '2 hours ago',
      count: 3,
    },
    {
      id: 3,
      type: 'info',
      message: 'System maintenance scheduled for tonight',
      time: '4 hours ago',
      count: 1,
    },
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_donor': return '👤';
      case 'blood_request': return '🩸';
      case 'donation_completed': return '✅';
      case 'hospital_verified': return '🏥';
      default: return '📝';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">System overview and management center.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-blue-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonors.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Total Donors</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-green-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHospitals}</p>
                <p className="text-sm text-gray-600 mt-1">Hospitals</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiAlertTriangle className="text-orange-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Active Requests</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FiHeart className="text-pink-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedDonations.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-purple-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Impact</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.livesSaved.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Lives Saved</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiShield className="text-emerald-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Health</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</p>
                <p className="text-sm text-gray-600 mt-1">System Health</p>
              </div>
            </div>

            {/* System Alerts */}
            {alerts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Alerts</h2>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-xl p-4 ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                          <div>
                            <p className="font-semibold">{alert.message}</p>
                            <p className="text-sm opacity-75 mt-1">{alert.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                            {alert.count} affected
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <button
                      onClick={() => navigate('/admin/audit-logs')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      View all <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                        </div>
                        <FiArrowRight className="text-gray-400 mt-1" size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: 'Manage Donors', icon: '👥', action: () => navigate('/admin/donors') },
                    { label: 'Verify Hospitals', icon: '✓', action: () => navigate('/admin/verify-hospitals') },
                    { label: 'Monitor Requests', icon: '🩸', action: () => navigate('/admin/requests') },
                    { label: 'View Analytics', icon: '📈', action: () => navigate('/admin/analytics') },
                    { label: 'Audit Logs', icon: '📝', action: () => navigate('/admin/audit-logs') },
                    { label: 'System Settings', icon: '⚙️', action: () => navigate('/admin/settings') },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.action}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-3"
                    >
                      <span className="text-xl">{action.icon}</span>
                      <span className="font-medium">{action.label}</span>
                      <FiArrowRight className="ml-auto text-gray-400" size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* System Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-8">
                <FiBarChart2 className="text-5xl text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">System Performance</h2>
                <p className="text-gray-600">Real-time monitoring of system health and performance metrics</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHeart className="text-green-600 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.livesSaved.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Lives Saved</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="text-blue-600 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalDonors.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Active Donors</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiActivity className="text-purple-600 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalHospitals}</p>
                  <p className="text-sm text-gray-600">Hospitals</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiShield className="text-emerald-600 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{stats.systemHealth}%</p>
                  <p className="text-sm text-gray-600">System Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
