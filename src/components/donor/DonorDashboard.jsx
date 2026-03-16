import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDroplet, FiCalendar, FiAward, FiArrowRight, FiHeart, FiActivity, FiTrendingUp, FiUsers, FiClock, FiMapPin } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Button from '../common/Button';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    totalDonations: 3,
    lastDonation: 'Jan 15, 2024',
    nextEligible: 'Mar 15, 2024',
    badges: 2,
    livesSaved: 12,
  });
  const [requests] = useState([
    {
      id: 1,
      hospital: 'City Medical Center',
      bloodGroup: 'O+',
      quantity: 2,
      type: 'emergency',
      createdAt: '2 hours ago',
      distance: '2.5 km',
      urgency: 'High',
    },
    {
      id: 2,
      hospital: 'Apollo Hospital',
      bloodGroup: 'O+',
      quantity: 1,
      type: 'non-emergency',
      createdAt: '4 hours ago',
      distance: '5.1 km',
      urgency: 'Medium',
    },
  ]);
  const [isEligible] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="donor" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your donation overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiDroplet className="text-red-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">This month</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                <p className="text-sm text-gray-600 mt-1">Total Donations</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Last</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">Jan 15</p>
                <p className="text-sm text-gray-600 mt-1">Last Donation</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiAward className="text-yellow-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Earned</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.badges}</p>
                <p className="text-sm text-gray-600 mt-1">Badges</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiHeart className="text-green-600 text-xl" />
                  </div>
                  <span className="text-sm text-gray-500">Impact</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.livesSaved}</p>
                <p className="text-sm text-gray-600 mt-1">Lives Saved</p>
              </div>
            </div>

            {/* Eligibility Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isEligible ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {isEligible ? (
                      <FiHeart className="text-green-600 text-xl" />
                    ) : (
                      <FiClock className="text-orange-600 text-xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isEligible ? 'Ready to Donate' : 'Rest Period'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isEligible 
                        ? 'You are eligible to donate today' 
                        : `Next eligible: ${stats.nextEligible}`
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  disabled={!isEligible}
                  className={!isEligible ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isEligible ? 'Find Donation Centers' : 'Not Eligible'}
                </Button>
              </div>
            </div>

            {/* Blood Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Blood Requests</h2>
                  <button
                    onClick={() => navigate('/donor/requests')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    View all <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{req.hospital}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {req.distance}
                          </span>
                          <span>{req.createdAt}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.type === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.urgency} Priority
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
                    </div>

                    <div className="flex gap-3">
                      <Button variant="primary" size="sm">
                        Accept Request
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FiCalendar className="text-blue-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Donation History</h3>
                <p className="text-sm text-gray-600">View your past donations and certificates</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FiHeart className="text-green-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Health Tracking</h3>
                <p className="text-sm text-gray-600">Monitor your health metrics and eligibility</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FiAward className="text-purple-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Achievements</h3>
                <p className="text-sm text-gray-600">View badges and rewards earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
