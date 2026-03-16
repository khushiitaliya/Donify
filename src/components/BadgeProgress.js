import React from 'react';

export default function BadgeProgress({ points, badges, maxPoints = 500 }) {
  const progress = Math.round((points / maxPoints) * 100);
  
  const allBadges = [
    { name: 'Bronze', minPoints: 0, icon: '🥉' },
    { name: 'Silver', minPoints: 100, icon: '🥈' },
    { name: 'Gold', minPoints: 250, icon: '🥇' },
    { name: 'Life Saver', minPoints: 500, icon: '⭐' },
  ];

  const completedBadges = allBadges.filter(b => badges?.includes(b.name));
  const nextBadge = allBadges.find(b => !badges?.includes(b.name));

  return (
    <div className="section-card bg-gradient-to-br from-red-50/90 to-orange-50/90">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm uppercase tracking-[0.22em] text-slate-500 font-semibold">Donor Points</h3>
          <p className="text-4xl font-black text-red-700">{points}</p>
        </div>
        <div className="text-4xl text-center">
          {completedBadges.length > 0 ? completedBadges[completedBadges.length - 1].icon : '👤'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-700 font-medium">Progress to next badge</span>
          <span className="text-slate-500">{progress}%</span>
        </div>
        <div className="w-full rounded-full bg-red-100 h-3 overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-3 bg-gradient-to-r from-orange-400 to-red-600 transition-all duration-500"
          ></div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-600 font-semibold mb-2">Badges Earned</div>
        <div className="flex flex-wrap gap-2">
          {allBadges.map((badge) => (
            <div
              key={badge.name}
              className={`p-2 rounded-2xl text-center text-sm font-semibold flex flex-col items-center justify-center w-16 ${
                badges?.includes(badge.name)
                  ? 'bg-yellow-200 text-yellow-900 border-2 border-yellow-400'
                  : 'bg-gray-200 text-gray-600 opacity-50 border-2 border-gray-300'
              }`}
            >
              <div className="text-xl">{badge.icon}</div>
              <div className="text-xs">{badge.name}</div>
            </div>
          ))}
        </div>
        {nextBadge && (
          <p className="text-xs text-gray-600 mt-2">
            {nextBadge.minPoints - points} points to unlock <strong>{nextBadge.name}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
