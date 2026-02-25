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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Directory</h1>
        <p className="text-gray-600">Find available donors in the network</p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
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
