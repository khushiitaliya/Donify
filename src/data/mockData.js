export const initialData = {
  users: [
    { id: 'u_admin', role: 'Admin', email: 'admin@donify.com', password: 'admin123', name: 'Admin' },
    { id: 'u_d1', role: 'Donor', email: 'john@example.com', password: 'donor123', name: 'John Doe', phone: '+1234567890' },
    { id: 'u_d2', role: 'Donor', email: 'priya@example.com', password: 'donor123', name: 'Priya Kumar', phone: '+1234567891' },
    { id: 'u_d3', role: 'Donor', email: 'mike@example.com', password: 'donor123', name: 'Mike Johnson', phone: '+1234567892' },
    { id: 'u_h1', role: 'Hospital', email: 'city@hospital.com', password: 'hosp123', hospitalName: 'City General Hospital', phone: '+1555-1000' },
  ],
  
  donors: [
    {
      id: 'u_d1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      age: 29,
      bloodGroup: 'A+',
      location: 'Downtown',
      contact: '555-0111',
      contactPreference: 'phone', // NEW: 'phone' or 'email'
      lastDonationDate: '2025-10-01',
      nextEligibleDate: '2025-11-26',
      available: true,
      points: 120,
      badges: ['Bronze'],
      notifiedRequests: [], // NEW: Track which requests notified this donor
      notificationHistory: [], // NEW: Complete notification history
      donationHistory: [
        { id: 'txn1', date: '2025-10-01', hospital: 'City Hospital', units: 1, txHash: '0xabc123def456' },
      ],
    },
    {
      id: 'u_d2',
      name: 'Priya Kumar',
      email: 'priya@example.com',
      phone: '+1234567891',
      age: 34,
      bloodGroup: 'O-',
      location: 'Downtown',
      contact: '555-0222',
      contactPreference: 'email', // NEW: Email preference
      lastDonationDate: '2024-12-01',
      nextEligibleDate: '2025-01-26',
      available: true,
      points: 340,
      badges: ['Silver', 'Gold'],
      notifiedRequests: [],
      notificationHistory: [],
      donationHistory: [],
    },
    {
      id: 'u_d3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      age: 42,
      bloodGroup: 'B+',
      location: 'Uptown',
      contact: '555-0333',
      contactPreference: 'phone', // NEW: Phone preference
      lastDonationDate: null,
      nextEligibleDate: new Date().toISOString(),
      available: true,
      points: 0,
      badges: [],
      notifiedRequests: [],
      notificationHistory: [],
      donationHistory: [],
    },
  ],
  
  hospitals: [
    {
      id: 'u_h1',
      name: 'City General Hospital',
      location: 'Downtown',
      contact: '555-1000',
      email: 'city@hospital.com',
      createdAt: '2024-01-15',
    },
  ],
  
  requests: [
    {
      id: 'r1',
      hospitalId: 'u_h1',
      hospitalName: 'City General Hospital',
      bloodGroup: 'A+',
      quantity: 2,
      location: 'Downtown',
      urgency: 'High',
      status: 'Sent',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 46 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
