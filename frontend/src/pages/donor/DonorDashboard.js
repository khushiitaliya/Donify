import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RequestCard from '../../components/RequestCard';
import BadgeProgress from '../../components/BadgeProgress';
import ContactPreferenceSelector from '../../components/ContactPreferenceSelector';
import TestNotificationPanel from '../../components/TestNotificationPanel';
import Modal from '../../components/Modal';

export default function DonorDashboard() {
  const { currentUser, donors, requests, acceptRequest, rejectRequest, setNotifications, setDonors } = useAuth();
  const donor = donors.find((d) => d.id === currentUser?.id) || donors[0];
  const [showConsent, setShowConsent] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ phone: donor?.phone || '', email: donor?.email || '' });

  const availableRequests = requests.filter((r) => r.status === 'Sent');
  const rewardsLeaderboard = [...donors]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  const getBadgesByPoints = (points) => {
    const badges = [];
    if (points >= 0) badges.push('Bronze');
    if (points >= 100) badges.push('Silver');
    if (points >= 250) badges.push('Gold');
    if (points >= 500) badges.push('Life Saver');
    return badges;
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setShowConsent(true);
  };

  const confirmConsent = () => {
    acceptRequest({ requestId: selectedRequest.id, donorId: donor.id });
    setDonors((ds) =>
      ds.map((d) =>
        d.id === donor.id
          ? (() => {
              const updatedPoints = (d.points || 0) + 10;
              return {
                ...d,
                available: false,
                points: updatedPoints,
                badges: getBadgesByPoints(updatedPoints),
              };
            })()
          : d
      )
    );
    setShowConsent(false);
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: 'Your generous donation will save lives! ❤️' },
      ...n,
    ]);
  };

  const toggleAvailability = () => {
    setDonors((ds) =>
      ds.map((d) =>
        d.id === donor.id ? { ...d, available: !d.available } : d
      )
    );
  };

  const handleReject = (request) => {
    rejectRequest(request.id);
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request declined' },
      ...n,
    ]);
  };

  const handleSaveProfile = () => {
    setDonors((ds) =>
      ds.map((d) =>
        d.id === donor.id
          ? { 
              ...d, 
              phone: editForm.phone,
              email: editForm.email
            }
          : d
      )
    );
    setShowEditProfile(false);
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: '✅ Contact information updated successfully!' },
      ...n,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {donor.name?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{donor.name}</p>
              <p className="text-sm text-gray-600">{donor.bloodGroup} • {donor.location}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${donor.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {donor.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Age</span>
              <span className="font-semibold">{donor.age} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Phone</span>
              <span className={`text-sm font-mono ${donor?.phone ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                {donor?.phone ? donor.phone : '❌ Not Set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email</span>
              <span className={`text-sm font-mono ${donor?.email ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                {donor?.email ? donor.email : '❌ Not Set'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setEditForm({ phone: donor?.phone || '', email: donor?.email || '' });
                setShowEditProfile(true);
              }}
              className="w-full py-2 rounded-lg font-bold transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              ✏️ Edit Contact Info
            </button>
            <button
              onClick={toggleAvailability}
              className={`w-full py-2 rounded-lg font-bold transition-colors ${
                donor.available
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {donor.available ? 'Mark Unavailable' : 'Mark Available'}
            </button>
          </div>
        </div>

        {/* Donation History */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Donation History</h2>
          {donor.donationHistory && donor.donationHistory.length > 0 ? (
            <div className="space-y-3">
              {donor.donationHistory.slice(0, 5).map((d) => (
                <div key={d.id} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <p className="font-semibold text-sm text-gray-900">{d.hospital}</p>
                  <p className="text-xs text-gray-600">{new Date(d.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600">{d.units} Unit(s)</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm text-gray-600">No donations yet</p>
            </div>
          )}
        </div>

        {/* Badge Progress */}
        <BadgeProgress points={donor.points} badges={donor.badges} />
      </div>

      {/* Emergency Requests */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Requests</h2>
        {availableRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-lg text-gray-600">No urgent requests at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {availableRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onAccept={() => handleAccept(req)}
                onReject={() => handleReject(req)}
                showActions={donor.available}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rewards Leaderboard */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rewards Leaderboard</h2>
        <p className="text-sm text-gray-600 mb-4">Top donors ranked by points earned through successful donations.</p>
        <div className="space-y-3">
          {rewardsLeaderboard.map((entry, idx) => {
            const isCurrent = entry.id === donor.id;
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border ${isCurrent ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-sm font-bold text-gray-800">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-xs text-gray-600">{entry.bloodGroup} • {entry.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{entry.points || 0} pts</p>
                    <p className="text-xs text-gray-500">{(entry.badges || []).join(', ') || 'No badges'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Preference Selector */}
      <div className="mb-8">
        <ContactPreferenceSelector />
      </div>

      {/* Test Notification Panel */}
      <TestNotificationPanel />

      {/* Consent Modal */}
      <Modal
        open={showConsent}
        onClose={() => setShowConsent(false)}
        title="Donation Consent"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> By accepting, you confirm you are healthy and eligible to donate. This donation is urgent.
            </p>
          </div>

          {selectedRequest && (
            <div className="p-4 bg-red-50 rounded border-l-4 border-red-500">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Request Details:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blood Group: <strong>{selectedRequest.bloodGroup}</strong></li>
                <li>• Quantity: <strong>{selectedRequest.quantity} Units</strong></li>
                <li>• Location: <strong>{selectedRequest.location}</strong></li>
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-700">
            You will be marked unavailable for 56 days (standard donation cycle). Our team will contact you shortly with pickup details.
          </p>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowConsent(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmConsent}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
            >
              I Consent to Donate
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title="Update Contact Information"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              <strong>📱 2-Way Communication:</strong> Please provide a valid phone number and email. You'll only receive notifications for blood requests matching your type, and only via your chosen preference.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📱 Phone Number
            </label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="e.g., +1-234-567-8900 or 1234567890"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">Used for SMS notifications</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="e.g., yourname@example.com"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">Used for email notifications</p>
          </div>

          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> You must have at least one valid contact method (phone OR email) to receive blood request notifications.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowEditProfile(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={!editForm.phone && !editForm.email}
              className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                editForm.phone || editForm.email
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
