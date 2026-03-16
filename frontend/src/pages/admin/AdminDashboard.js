import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { donors, hospitals, requests, auditLogs } = useAuth();
  const [filterType, setFilterType] = useState('All');

  const stats = {
    totalDonors: donors.length,
    availableDonors: donors.filter((d) => d.available).length,
    totalHospitals: hospitals.length,
    activeRequests: requests.filter((r) => r.status === 'Sent').length,
    acceptedRequests: requests.filter((r) => r.status === 'Accepted').length,
    completedRequests: requests.filter((r) => r.status === 'Completed').length,
    cancelledRequests: requests.filter((r) => r.status === 'Cancelled').length,
  };

  const bloodGroupDemand = requests.reduce((acc, r) => {
    if (r.status !== 'Completed' && r.status !== 'Cancelled') {
      acc[r.bloodGroup] = (acc[r.bloodGroup] || 0) + r.quantity;
    }
    return acc;
  }, {});

  const topDonors = donors
    .map((d) => ({
      ...d,
      donationCount: d.donationHistory ? d.donationHistory.length : 0,
    }))
    .sort((a, b) => (b.donationHistory?.length || 0) - (a.donationHistory?.length || 0))
    .slice(0, 5);

  const rewardsLeaderboard = donors
    .map((d) => ({
      ...d,
      points: d.points || 0,
      badgeCount: (d.badges || []).length,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  let filteredLogs = auditLogs;
  if (filterType !== 'All') {
    filteredLogs = auditLogs.filter((log) => log.type === filterType);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and analytics</p>
      </div>

      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rewards Leaderboard</h2>
        <p className="text-sm text-gray-600 mb-4">Top performers by points and earned badges.</p>
        {rewardsLeaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No donors available</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardsLeaderboard.map((donor, idx) => (
              <div key={donor.id} className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-100 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">#{idx + 1}</span>
                  <span className="text-xs px-2 py-1 rounded bg-white border border-yellow-300 text-yellow-800 font-semibold">
                    {donor.points} pts
                  </span>
                </div>
                <p className="font-semibold text-gray-900">{donor.name}</p>
                <p className="text-xs text-gray-600 mb-2">{donor.bloodGroup}</p>
                <p className="text-xs text-gray-700">Badges: {donor.badgeCount}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-sm text-gray-600 font-semibold uppercase">Total Donors</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalDonors}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.availableDonors} available now</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <p className="text-sm text-gray-600 font-semibold uppercase">Total Hospitals</p>
          <p className="text-4xl font-bold text-green-600">{stats.totalHospitals}</p>
          <p className="text-xs text-gray-600 mt-2">Registered networks</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
          <p className="text-sm text-gray-600 font-semibold uppercase">Active Requests</p>
          <p className="text-4xl font-bold text-red-600">{stats.activeRequests}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.acceptedRequests} accepted</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <p className="text-sm text-gray-600 font-semibold uppercase">Completed</p>
          <p className="text-4xl font-bold text-purple-600">{stats.completedRequests}</p>
          <p className="text-xs text-gray-600 mt-2">Success rate: {requests.length > 0 ? Math.round((stats.completedRequests / requests.length) * 100) : 0}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Blood Group Demand */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Blood Group Demand Trends</h2>
          {Object.keys(bloodGroupDemand).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No active requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(bloodGroupDemand)
                .sort(([, a], [, b]) => b - a)
                .map(([bloodGroup, units]) => {
                  const maxUnits = Math.max(...Object.values(bloodGroupDemand));
                  const percentage = (units / maxUnits) * 100;
                  return (
                    <div key={bloodGroup}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{bloodGroup}</span>
                        <span className="text-sm text-red-600 font-bold">{units}U</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Donors</h2>
          {topDonors.filter((d) => d.donationCount > 0).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No donations recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topDonors
                .filter((d) => d.donationCount > 0)
                .map((donor, idx) => (
                  <div key={donor.id} className="p-3 bg-gray-50 rounded border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-800">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{donor.name}</p>
                          <p className="text-xs text-gray-600">{donor.bloodGroup}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{donor.donationCount}</p>
                        <p className="text-xs text-gray-600">donations</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200  shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Logs</h2>

        <div className="mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option>All</option>
            <option>login</option>
            <option>create_request</option>
            <option>accept_request</option>
            <option>in_progress</option>
            <option>complete</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-bold text-gray-700">Type</th>
                  <th className="text-left py-3 px-2 font-bold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-2 font-bold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-gray-700 text-xs font-mono">
                      {log.meta && Object.keys(log.meta).length > 0
                        ? JSON.stringify(log.meta).substring(0, 50) + '...'
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
