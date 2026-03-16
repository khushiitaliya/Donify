export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BLOOD_GROUP_COLORS = {
  'A+': 'bg-red-100 text-red-800',
  'A-': 'bg-red-200 text-red-900',
  'B+': 'bg-orange-100 text-orange-800',
  'B-': 'bg-orange-200 text-orange-900',
  'O+': 'bg-yellow-100 text-yellow-800',
  'O-': 'bg-yellow-200 text-yellow-900',
  'AB+': 'bg-pink-100 text-pink-800',
  'AB-': 'bg-pink-200 text-pink-900',
};

export const REQUEST_TYPES = {
  emergency: { label: 'Emergency', color: 'red', badge: '🚨' },
  'non-emergency': { label: 'Routine', color: 'yellow', badge: '⏰' },
};

export const USER_ROLES = ['donor', 'hospital', 'admin'];

export const DONATION_STATUS = ['pending', 'accepted', 'completed', 'rejected'];
