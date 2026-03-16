import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function BlockchainPage() {
  const { donors, requests } = useAuth();

  const allRecords = donors
    .filter((d) => d.donationHistory && d.donationHistory.length > 0)
    .flatMap((d) =>
      d.donationHistory.map((h) => ({
        ...h,
        donorId: d.id,
        donorName: d.name,
        bloodGroup: d.bloodGroup,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const completedRequests = requests.filter((r) => r.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blockchain Records</h1>
        <p className="text-gray-600">Immutable donation records on the network</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{allRecords.length}</div>
          <p className="text-gray-600 text-sm mt-1">Total Donations Recorded</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-3xl font-bold text-green-600">{completedRequests.length}</div>
          <p className="text-gray-600 text-sm mt-1">Completed Requests</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{donors.length}</div>
          <p className="text-gray-600 text-sm mt-1">Active Donors</p>
        </div>
      </div>

      {allRecords.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
          <p className="text-4xl mb-4">⛓️</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Records Yet</h2>
          <p className="text-gray-600">Donation records will appear here once donations are completed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Donor</p>
                  <p className="text-lg font-bold text-gray-900">{record.donorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Hospital</p>
                  <p className="text-lg font-bold text-gray-900">{record.hospital}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Units</p>
                  <p className="text-lg font-bold text-gray-900">{record.units}U</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Transaction Hash (Blockchain)</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm text-red-600 font-mono bg-gray-50 px-3 py-2 rounded flex-1 break-all">
                    {record.txHash}
                  </code>
                  <span className="text-2xl text-green-600" title="Verified on blockchain">
                    ✓
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                <span>🔒 Immutable Record</span>
                <span>•</span>
                <span>📅 {new Date(record.date).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
