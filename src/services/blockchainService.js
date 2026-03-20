/**
 * Simulated Blockchain Service for Donify Rewards
 *
 * Implements a virtual LifeToken (LFT) economy:
 *  - Donors earn 50 LFT per completed donation
 *  - Tokens are recorded as on-chain mint transactions with deterministic hashes
 *  - Tokens can be redeemed from the Rewards Store (generates a burn/redeem tx)
 */

// ---------------------------------------------------------------------------
// Hash generation (deterministic, reproducible simulation)
// ---------------------------------------------------------------------------

/**
 * Generates a realistic-looking 64-char hex transaction hash.
 * Uses a linear-congruential technique seeded by the input string so the
 * same inputs always produce the same hash (immutability simulation).
 */
export const generateTxHash = (seedData) => {
  const str = typeof seedData === 'string' ? seedData : JSON.stringify(seedData);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const base = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');

  // Stretch to 64 chars
  let hex = '';
  for (let i = 0; i < 4; i++) {
    const val = (parseInt(base, 16) * (i + 1) * 0x6d2b79f5 + i * 0x9e3779b9) >>> 0;
    hex += val.toString(16).padStart(16, '0');
  }
  return '0x' + hex.slice(0, 64);
};

// ---------------------------------------------------------------------------
// Token constants
// ---------------------------------------------------------------------------

export const TOKENS_PER_DONATION = 50;

export const TOKEN_SYMBOL = 'LFT';

// ---------------------------------------------------------------------------
// Rewards catalogue
// ---------------------------------------------------------------------------

export const REWARD_STORE = [
  {
    id: 'rw_priority',
    name: 'Priority Blood Access',
    icon: '🩸',
    cost: 100,
    category: 'Healthcare',
    description:
      'Guaranteed priority access to blood at any partnered hospital when you or your family need it.',
    popular: false,
  },
  {
    id: 'rw_certificate',
    name: 'Donor Certificate',
    icon: '🏆',
    cost: 150,
    category: 'Recognition',
    description:
      'Official digital Donify blood donor certificate you can share on LinkedIn or print.',
    popular: true,
  },
  {
    id: 'rw_checkup',
    name: 'Free Health Checkup',
    icon: '🏥',
    cost: 200,
    category: 'Healthcare',
    description:
      'Complete health screening (CBC, BP, Blood Sugar) at partnered diagnostic centres.',
    popular: true,
  },
  {
    id: 'rw_immunity',
    name: 'Immunity Boost Pack',
    icon: '💊',
    cost: 300,
    category: 'Wellness',
    description:
      'Curated vitamins & supplements pack (Iron, Vitamin C, Zinc) delivered to your door.',
    popular: false,
  },
  {
    id: 'rw_premium',
    name: 'Premium Donor Status',
    icon: '⭐',
    cost: 500,
    category: 'Status',
    description:
      'Exclusive platinum badge on your profile, highlighted in donor leaderboard, and VIP support.',
    popular: false,
  },
];

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

/**
 * Create a MINT transaction record (tokens awarded for a donation).
 */
export const createMintTransaction = ({ donorId, donorName, requestId, amount }) => {
  const ts = new Date().toISOString();
  const txHash = generateTxHash(`MINT:${donorId}:${requestId}:${amount}:${ts}`);
  return {
    id: `tx_mint_${Date.now()}`,
    type: 'mint',
    donorId,
    donorName,
    amount,
    requestId,
    timestamp: ts,
    txHash,
    status: 'confirmed',
    description: `+${amount} ${TOKEN_SYMBOL} — Donation reward`,
  };
};

/**
 * Create a REDEEM transaction record (tokens spent at rewards store).
 */
export const createRedeemTransaction = ({ donorId, donorName, rewardId, rewardName, amount }) => {
  const ts = new Date().toISOString();
  const txHash = generateTxHash(`REDEEM:${donorId}:${rewardId}:${amount}:${ts}`);
  return {
    id: `tx_redeem_${Date.now()}`,
    type: 'redeem',
    donorId,
    donorName,
    rewardId,
    rewardName,
    amount,
    timestamp: ts,
    txHash,
    status: 'confirmed',
    description: `-${amount} ${TOKEN_SYMBOL} — Redeemed: ${rewardName}`,
  };
};

// ---------------------------------------------------------------------------
// Badge thresholds (aligned with existing badge system)
// ---------------------------------------------------------------------------

export const BADGE_THRESHOLDS = [
  { name: 'Bronze', minPoints: 0, icon: '🥉' },
  { name: 'Silver', minPoints: 100, icon: '🥈' },
  { name: 'Gold', minPoints: 250, icon: '🥇' },
  { name: 'Life Saver', minPoints: 500, icon: '⭐' },
];

export const getBadgesForPoints = (points) =>
  BADGE_THRESHOLDS.filter((b) => points >= b.minPoints).map((b) => b.name);
