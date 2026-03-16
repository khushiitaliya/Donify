import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiDroplet, FiUsers, FiTrendingUp, FiArrowRight, FiActivity, FiHeart, FiClock, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Button from '../common/Button';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    totalRequests: 15,
    activeRequests: 3,
    completedRequests: 12,
    totalDonors: 8,
    livesSaved: 45,
  });
  const [recentRequests] = useState([
    {
      id: 1,
      bloodGroup: 'O+',
      quantity: 2,
      urgency: 'emergency',
      status: 'pending',
      createdAt: '2 hours ago',
      patientName: 'John Doe',
    },
    {
      id: 2,
      bloodGroup: 'A+',
      quantity: 1,
      urgency: 'routine',
      status: 'accepted',
      createdAt: '5 hours ago',
      patientName: 'Jane Smith',
    },
  ]);
  const [inventory] = useState([
    { bloodGroup: 'O+', units: 5, status: 'adequate', trend: 'stable' },
    { bloodGroup: 'A+', units: 2, status: 'low', trend: 'decreasing' },
    { bloodGroup: 'B+', units: 8, status: 'adequate', trend: 'increasing' },
    { bloodGroup: 'AB+', units: 1, status: 'critical', trend: 'stable' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'adequate': return 'text-green-600 bg-green-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="hospital" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your blood requests and inventory.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                variant="primary" 
                onClick={() => navigate('/hospital/create')}
                className="flex items-center gap-2"
              >
                <FiPlus size={20} />
                Create Blood Request
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/hospital/inventory')}
                className="flex items-center gap-2"
              >
                <FiBarChart2 size={20} />
                Manage Inventory
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiDroplet className="text-blue-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Total Requests</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-orange-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Active Requests</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiHeart className="text-green-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-purple-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonors}</p>
                <p className="text-sm text-gray-600 mt-1">Active Donors</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-red-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Impact</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.livesSaved}</p>
                <p className="text-sm text-gray-600 mt-1">Lives Saved</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Requests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
                    <button
                      onClick={() => navigate('/hospital/requests')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      View all <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {recentRequests.map((req) => (
                    <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Request #{req.id}</h3>
                          <p className="text-sm text-gray-500 mb-1">Patient: {req.patientName}</p>
                          <p className="text-sm text-gray-500">{req.createdAt}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.urgency === 'emergency'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.urgency === 'emergency' ? 'Emergency' : 'Routine'}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Blood Group</p>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">{req.bloodGroup}</span>
                            </div>
                            <span className="font-semibold text-lg">{req.bloodGroup}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Quantity</p>
                          <p className="font-semibold text-lg">{req.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {req.status === 'pending' && (
                          <Button variant="danger" size="sm">
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Inventory */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Blood Inventory</h2>
                    <button
                      onClick={() => navigate('/hospital/inventory')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      Manage <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {inventory.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{item.bloodGroup}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-2xl font-bold text-gray-900">{item.units}</p>
                          <p className="text-sm text-gray-600">units available</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <FiTrendingUp className={`text-lg ${
                            item.trend === 'increasing' ? 'text-green-500' :
                            item.trend === 'decreasing' ? 'text-red-500' :
                            'text-gray-500'
                          }`} />
                          <span className="text-gray-600 capitalize">{item.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FiUsers className="text-green-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Donor Directory</h3>
                <p className="text-sm text-gray-600">Browse and contact potential donors</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FiBarChart2 className="text-purple-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Request Analytics</h3>
                <p className="text-sm text-gray-600">View detailed analytics and reports</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FiCalendar className="text-blue-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Inventory History</h3>
                <p className="text-sm text-gray-600">Track inventory changes over time</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FiActivity className="text-orange-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hospital Profile</h3>
                <p className="text-sm text-gray-600">Manage hospital information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
