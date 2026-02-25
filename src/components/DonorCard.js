import React from 'react';

export default function DonorCard({ donor, onSelect, score, compatibility }) {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg">{donor.name}</h4>
          <p className="text-sm text-gray-600">{donor.age} years • {donor.bloodGroup}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${donor.available ? 'bg-green-600' : 'bg-gray-400'}`}>
          {donor.bloodGroup.substring(0, 1)}
        </div>
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-semibold">{donor.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-bold ${donor.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {donor.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Points:</span>
          <span className="font-semibold text-red-600">{donor.points}</span>
        </div>
        {donor.badges && donor.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {donor.badges.map((badge) => (
              <span key={badge} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {score !== undefined && (
        <div className="mb-3 p-2 bg-gray-100 rounded">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-700">Matching Score</span>
            <span className="font-bold text-red-600">{score}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div style={{ width: `${score}%` }} className="bg-red-600 h-2 rounded-full"></div>
          </div>
        </div>
      )}

      {compatibility && (
        <div className="mb-3 text-xs space-y-1 text-gray-700">
          {compatibility.bloodGroup && (
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>{compatibility.bloodGroup}</span>
            </div>
          )}
          {compatibility.location && (
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>{compatibility.location}</span>
            </div>
          )}
          {compatibility.available && (
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Available</span>
            </div>
          )}
        </div>
      )}

      {onSelect && donor.available && (
        <button
          onClick={() => onSelect(donor)}
          className="w-full px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
        >
          Select Donor
        </button>
      )}
    </div>
  );
}
