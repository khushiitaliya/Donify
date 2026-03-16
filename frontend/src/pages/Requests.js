import React from 'react';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

export default function RequestsPage() {
  const { requests } = useAuth();

  const activeRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Expired' && r.status !== 'Cancelled');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Emergency Requests</h1>
        <p className="text-gray-600">Current urgent blood donation requests in the network</p>
      </div>

      {activeRequests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
          <p className="text-4xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Requests</h2>
          <p className="text-gray-600">All blood requests have been fulfilled. Thank you!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
