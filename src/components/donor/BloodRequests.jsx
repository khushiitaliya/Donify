import React, { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Button from '../common/Button';

export default function BloodRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [requests] = useState([
    {
      id: 1,
      hospital: 'City Medical Center',
      bloodGroup: 'O+',
      quantity: 2,
      urgency: 'emergency',
      location: 'New York, NY',
      patientName: 'John Doe',
      createdAt: '2 hours ago',
      expiresAt: '22 hours',
    },
    {
      id: 2,
      hospital: 'Apollo Hospital',
      bloodGroup: 'O+',
      quantity: 1,
      urgency: 'routine',
      location: 'Los Angeles, CA',
      patientName: 'Jane Smith',
      createdAt: '4 hours ago',
      expiresAt: '20 hours',
    },
    {
      id: 3,
      hospital: 'Memorial Hospital',
      bloodGroup: 'A+',
      quantity: 3,
      urgency: 'emergency',
      location: 'Chicago, IL',
      patientName: 'Bob Johnson',
      createdAt: '6 hours ago',
      expiresAt: '18 hours',
    },
  ]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUrgency === 'all' || req.urgency === filterUrgency;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="donor" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
                <p className="text-gray-600 mt-1">Find blood donation opportunities near you</p>
              </div>
              <Button variant="primary">
                Refresh
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by hospital or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiFilter size={18} className="text-gray-500" />
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-red focus:border-transparent outline-none"
                  >
                    <option value="all">All Urgency</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.hospital}</h3>
                      <p className="text-gray-500 text-sm">{request.location}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.urgency === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.urgency === 'emergency' ? '🚨 Emergency' : '⏰ Routine'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-xs">Blood Group</p>
                      <p className="font-bold text-blood-red text-lg">{request.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Quantity</p>
                      <p className="font-bold">{request.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Patient</p>
                      <p className="font-bold">{request.patientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Expires in</p>
                      <p className="font-bold text-orange-600">{request.expiresAt}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Posted {request.createdAt}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        Accept Request
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-lg">No blood requests found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
