import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DonorCard from '../components/DonorCard';

export default function DonorsPage() {
  const { donors } = useAuth();
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const locations = ['All', ...new Set(donors.map((d) => d.location))];

  let filtered = donors;
  if (filterBloodGroup !== 'All') {
    filtered = filtered.filter((d) => d.bloodGroup === filterBloodGroup);
  }
  if (filterLocation !== 'All') {
    filtered = filtered.filter((d) => d.location === filterLocation);
  }

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.8fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Directory</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Find blood donors by type and location.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Filter the network to surface available donors, compare readiness, and move emergency matches into action quickly.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Total Donors</div>
              <div className="mt-2 text-4xl font-black">{donors.length}</div>
            </div>
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Available Now</div>
              <div className="mt-2 text-4xl font-black">{donors.filter((donor) => donor.available).length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="input-shell"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="input-shell"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="section-card text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Donors Found</h2>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((donor) => (
            <DonorCard
              key={donor.id}
              donor={donor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
