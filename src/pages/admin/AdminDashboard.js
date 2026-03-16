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

  let filteredLogs = auditLogs;
  if (filterType !== 'All') {
    filteredLogs = auditLogs.filter((log) => log.type === filterType);
  }

  const summaryCards = [
    { label: 'Total Donors', value: stats.totalDonors, subtext: `${stats.availableDonors} available now`, accent: 'text-blue-600' },
    { label: 'Total Hospitals', value: stats.totalHospitals, subtext: 'Registered networks', accent: 'text-green-600' },
    { label: 'Active Requests', value: stats.activeRequests, subtext: `${stats.acceptedRequests} accepted`, accent: 'text-red-600' },
    { label: 'Completed', value: stats.completedRequests, subtext: `Success rate: ${requests.length > 0 ? Math.round((stats.completedRequests / requests.length) * 100) : 0}%`, accent: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Admin Overview</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">See demand, participation, and system health in one view.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Review operational trends, monitor the request funnel, and audit key events across the blood donation network.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {summaryCards.map((card) => (
              <div key={card.label} className="metric-card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{card.label}</div>
                <div className="mt-2 text-4xl font-black">{card.value}</div>
                <div className="mt-1 text-sm text-white/70">{card.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Total Donors</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalDonors}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.availableDonors} available now</p>
        </div>

        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Total Hospitals</p>
          <p className="text-4xl font-bold text-green-600">{stats.totalHospitals}</p>
          <p className="text-xs text-gray-600 mt-2">Registered networks</p>
        </div>

        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Active Requests</p>
          <p className="text-4xl font-bold text-red-600">{stats.activeRequests}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.acceptedRequests} accepted</p>
        </div>

        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Completed</p>
          <p className="text-4xl font-bold text-purple-600">{stats.completedRequests}</p>
          <p className="text-xs text-gray-600 mt-2">Success rate: {requests.length > 0 ? Math.round((stats.completedRequests / requests.length) * 100) : 0}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Blood Group Demand */}
        <div className="section-card">
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
        <div className="section-card">
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
      <div className="section-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Logs</h2>

        <div className="mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-shell max-w-xs"
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
