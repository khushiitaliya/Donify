import React from 'react';

export default function DonorCard({ donor, onSelect, score, compatibility }) {
  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-100/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="blood-pill mb-2">Donor Profile</div>
          <h4 className="font-display text-xl font-extrabold text-slate-900">{donor.name}</h4>
          <p className="text-sm text-slate-500">{donor.age} years • {donor.bloodGroup}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white shadow-lg ${donor.available ? 'bg-gradient-to-br from-emerald-500 to-green-700' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
          {donor.bloodGroup}
        </div>
      </div>

      <div className="mb-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Location</span>
          <span className="font-semibold text-slate-800">{donor.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status</span>
          <span className={`status-chip ${donor.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            {donor.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Points</span>
          <span className="font-semibold text-red-700">{donor.points}</span>
        </div>
        {donor.badges && donor.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {donor.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {score !== undefined && (
        <div className="mb-4 rounded-2xl bg-slate-900 px-4 py-4 text-white">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/70">Matching Score</span>
            <span className="font-bold text-orange-300">{score}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div style={{ width: `${score}%` }} className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
          </div>
        </div>
      )}

      {compatibility && (
        <div className="mb-4 space-y-1 text-xs text-slate-700">
          {compatibility.bloodGroup && (
            <div className="flex items-center">
              <span className="mr-2 text-green-600">✓</span>
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
          className="action-primary w-full"
        >
          Select Donor
        </button>
      )}
    </div>
  );
}
