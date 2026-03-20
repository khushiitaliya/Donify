import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { REWARD_STORE, TOKEN_SYMBOL, TOKENS_PER_DONATION } from '../services/blockchainService';

export default function BlockchainPage() {
  const { donors, requests, currentUser, redeemReward } = useAuth();
  const [activeTab, setActiveTab] = useState('records');
  const [redeeming, setRedeeming] = useState(null);

  const currentDonor = donors.find((d) => d.id === currentUser?.id);

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

  // All token mint transactions across all donors
  const allTokenTxs = donors
    .flatMap((d) =>
      (d.tokenTransactions || []).map((tx) => ({ ...tx, donorName: tx.donorName || d.name }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalMinted = donors.reduce((sum, d) => {
    const minted = (d.tokenTransactions || []).filter((t) => t.type === 'mint').reduce((s, t) => s + t.amount, 0);
    return sum + minted;
  }, 0);

  const totalRedeemed = donors.reduce((sum, d) => {
    const redeemed = (d.tokenTransactions || []).filter((t) => t.type === 'redeem').reduce((s, t) => s + t.amount, 0);
    return sum + redeemed;
  }, 0);

  const leaderboard = [...donors]
    .sort((a, b) => (b.tokens || 0) - (a.tokens || 0))
    .slice(0, 10);

  const completedRequests = requests.filter((r) => r.status === 'Completed');

  const handleRedeem = (reward) => {
    if (!currentDonor) return;
    setRedeeming(reward.id);
    redeemReward({ donorId: currentDonor.id, reward });
    setTimeout(() => setRedeeming(null), 800);
  };

  const tabs = [
    { id: 'records', label: '⛓️ Donation Records' },
    { id: 'rewards', label: '🎁 Rewards Store' },
    { id: 'tokens', label: '🪙 Token Ledger' },
    { id: 'leaderboard', label: '🏆 Leaderboard' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.8fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Blockchain Rewards</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Earn tokens. Save lives. Get rewarded.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
              Every donation mints <strong>{TOKENS_PER_DONATION} {TOKEN_SYMBOL}</strong> tokens on-chain. Redeem them for healthcare perks, certificates, and more.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Total Minted</div>
              <div className="mt-2 text-3xl font-black">{totalMinted} <span className="text-lg">{TOKEN_SYMBOL}</span></div>
            </div>
            {currentDonor && (
              <div className="metric-card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/65">Your Wallet</div>
                <div className="mt-2 text-3xl font-black">{currentDonor.tokens || 0} <span className="text-lg">{TOKEN_SYMBOL}</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-metric">
          <div className="text-2xl font-bold text-blue-600">{allRecords.length}</div>
          <p className="text-gray-600 text-xs mt-1">Donation Records</p>
        </div>
        <div className="surface-metric">
          <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
          <p className="text-gray-600 text-xs mt-1">Completed Requests</p>
        </div>
        <div className="surface-metric">
          <div className="text-2xl font-bold text-purple-600">{totalMinted}</div>
          <p className="text-gray-600 text-xs mt-1">Total {TOKEN_SYMBOL} Minted</p>
        </div>
        <div className="surface-metric">
          <div className="text-2xl font-bold text-orange-600">{totalRedeemed}</div>
          <p className="text-gray-600 text-xs mt-1">Total {TOKEN_SYMBOL} Redeemed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/80 text-gray-700 hover:bg-red-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Donation Records ── */}
      {activeTab === 'records' && (
        <>
          {allRecords.length === 0 ? (
            <div className="section-card text-center">
              <p className="text-4xl mb-4">⛓️</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Records Yet</h2>
              <p className="text-gray-600">Donation records appear here once hospitals confirm donations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allRecords.map((record) => (
                <div
                  key={record.id}
                  className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-lg shadow-red-100/30 transition hover:-translate-y-1 hover:shadow-2xl"
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
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Transaction Hash</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-red-600 font-mono bg-gray-50 px-3 py-2 rounded flex-1 break-all">
                        {record.txHash || 'N/A'}
                      </code>
                      <span className="text-2xl text-green-600" title="Verified">✓</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    <span>🔒 Immutable Record</span>
                    <span>•</span>
                    <span className="font-semibold text-orange-600">+{TOKENS_PER_DONATION} {TOKEN_SYMBOL} minted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: Rewards Store ── */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {currentDonor ? (
            <div className="section-card flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Your {TOKEN_SYMBOL} Wallet</p>
                <p className="text-4xl font-black text-red-700">{currentDonor.tokens || 0} <span className="text-base font-semibold text-gray-600">{TOKEN_SYMBOL}</span></p>
                <p className="text-xs text-gray-400 mt-1">Each donation earns +{TOKENS_PER_DONATION} {TOKEN_SYMBOL}</p>
              </div>
              <div className="text-5xl">🪙</div>
            </div>
          ) : (
            <div className="section-card text-center text-gray-600">
              <p className="text-2xl mb-2">🔐</p>
              <p>Log in as a donor to redeem rewards with your tokens.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REWARD_STORE.map((reward) => {
              const canAfford = currentDonor && (currentDonor.tokens || 0) >= reward.cost;
              const alreadyRedeemed = (currentDonor?.redeemedRewards || []).some((r) => r.rewardId === reward.id);
              return (
                <div
                  key={reward.id}
                  className={`glass-panel rounded-[24px] border p-6 flex flex-col gap-4 transition hover:-translate-y-1 hover:shadow-xl ${
                    alreadyRedeemed ? 'border-green-300 bg-green-50/40' : 'border-white/70'
                  }`}
                >
                  {reward.popular && (
                    <span className="self-start rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-700">⚡ Popular</span>
                  )}
                  <div className="text-5xl">{reward.icon}</div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">{reward.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{reward.category}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-lg font-black text-red-700">{reward.cost} <span className="text-sm font-semibold">{TOKEN_SYMBOL}</span></p>
                    {alreadyRedeemed ? (
                      <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">✅ Redeemed</span>
                    ) : (
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!currentDonor || !canAfford || redeeming === reward.id}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                          canAfford && currentDonor
                            ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {redeeming === reward.id ? '⏳' : canAfford ? 'Redeem' : `Need ${reward.cost - (currentDonor?.tokens || 0)} more`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {currentDonor?.redeemedRewards?.length > 0 && (
            <div className="section-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Redemption History</h3>
              <div className="space-y-3">
                {currentDonor.redeemedRewards.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 border border-green-100">
                    <div>
                      <p className="font-semibold text-gray-800">{r.rewardName}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{r.txHash?.slice(0, 24)}…</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(r.redeemedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Token Ledger ── */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          {allTokenTxs.length === 0 ? (
            <div className="section-card text-center">
              <p className="text-4xl mb-4">🪙</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Token Transactions Yet</h2>
              <p className="text-gray-600">Token transactions appear here when donations are completed or rewards are redeemed.</p>
            </div>
          ) : (
            allTokenTxs.map((tx) => (
              <div key={tx.id} className="glass-panel rounded-[20px] border border-white/70 p-5 flex flex-col gap-3 hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full ${tx.type === 'mint' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {tx.type === 'mint' ? '⬆️' : '⬇️'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{tx.donorName}</p>
                      <p className="text-sm text-gray-500">{tx.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-black ${tx.type === 'mint' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {tx.type === 'mint' ? '+' : '-'}{tx.amount} {TOKEN_SYMBOL}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-red-600 font-mono bg-gray-50 px-3 py-1.5 rounded flex-1 break-all">{tx.txHash}</code>
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${tx.type === 'mint' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {tx.type === 'mint' ? 'MINT' : 'REDEEM'}
                  </span>
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  <span className="text-green-500">● {tx.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: Leaderboard ── */}
      {activeTab === 'leaderboard' && (
        <div className="section-card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top {TOKEN_SYMBOL} Token Holders</h2>
          <div className="space-y-3">
            {leaderboard.map((donor, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={donor.id}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition ${
                    donor.id === currentUser?.id
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl w-9 text-center">{medals[index] || `#${index + 1}`}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-700 text-white font-bold text-lg shadow">
                    {donor.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {donor.name}
                      {donor.id === currentUser?.id && <span className="ml-2 text-xs text-red-600 font-semibold">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{donor.bloodGroup} • {donor.donationHistory?.length || 0} donations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-red-700">{donor.tokens || 0} <span className="text-xs font-semibold text-gray-500">{TOKEN_SYMBOL}</span></p>
                    <p className="text-xs text-gray-400">{donor.points || 0} pts</p>
                  </div>
                  <div className="flex gap-1">
                    {(donor.badges || []).slice(0, 2).map((b) => (
                      <span key={b} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{b}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
