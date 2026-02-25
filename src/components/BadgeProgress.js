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
    <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-600 font-semibold">Donor Points</h3>
          <p className="text-4xl font-bold text-red-600">{points}</p>
        </div>
        <div className="text-4xl text-center">
          {completedBadges.length > 0 ? completedBadges[completedBadges.length - 1].icon : '👤'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-700 font-medium">Progress to next badge</span>
          <span className="text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-3 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
          ></div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-600 font-semibold mb-2">Badges Earned</div>
        <div className="flex flex-wrap gap-2">
          {allBadges.map((badge) => (
            <div
              key={badge.name}
              className={`p-2 rounded-lg text-center text-sm font-semibold flex flex-col items-center justify-center w-16 ${
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
