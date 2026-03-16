import React from 'react';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

export default function RequestsPage() {
  const { requests } = useAuth();

  const activeRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Expired' && r.status !== 'Cancelled');

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.8fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Urgent Feed</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Emergency blood requests across the network.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Track current demand, review hospital locations, and surface the most urgent active requests first.</p>
          </div>
          <div className="metric-card">
            <div className="text-xs uppercase tracking-[0.2em] text-white/65">Requests Active</div>
            <div className="mt-2 text-4xl font-black">{activeRequests.length}</div>
          </div>
        </div>
      </section>

      {activeRequests.length === 0 ? (
        <div className="section-card text-center">
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
