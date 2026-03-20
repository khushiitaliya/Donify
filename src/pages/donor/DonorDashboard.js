import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RequestCard from '../../components/RequestCard';
import BadgeProgress from '../../components/BadgeProgress';
import ContactPreferenceSelector from '../../components/ContactPreferenceSelector';
import Modal from '../../components/Modal';

export default function DonorDashboard() {
  const { currentUser, donors, requests, acceptRequest, rejectRequest, setNotifications, setDonors } = useAuth();
  const donor = donors.find((d) => d.id === currentUser?.id) || donors[0];
  const [showConsent, setShowConsent] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ phone: donor?.phone || '', email: donor?.email || '' });

  const normalizeText = (value) => (value || '').toString().trim().toLowerCase();
  const cooldownEndDate = donor?.nextEligibleDate ? new Date(donor.nextEligibleDate) : null;
  const isCooldownActive = Boolean(
    donor?.cooldownActive && cooldownEndDate && cooldownEndDate.getTime() > Date.now()
  );

  const availableRequests = requests.filter((r) => {
    if (r.status !== 'Sent') return false;
    if (isCooldownActive) return false;
    if (!donor?.available) return false;
    const bloodMatch = normalizeText(r.bloodGroup) === normalizeText(donor?.bloodGroup);
    const cityMatch = normalizeText(r.location) === normalizeText(donor?.location);
    const alreadyRejected = (r.donorRejections || []).some((rejection) => rejection.donorId === donor?.id);
    return bloodMatch && cityMatch && !alreadyRejected;
  });

  const donorRequestTimeline = requests
    .filter((r) => {
      const bloodMatch = normalizeText(r.bloodGroup) === normalizeText(donor?.bloodGroup);
      const cityMatch = normalizeText(r.location) === normalizeText(donor?.location);
      const acceptedByMe = r.acceptedBy === donor?.id;
      const rejectedByMe = (r.donorRejections || []).some((rejection) => rejection.donorId === donor?.id);
      return (bloodMatch && cityMatch) || acceptedByMe || rejectedByMe;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setShowConsent(true);
  };

  const confirmConsent = () => {
    acceptRequest({ requestId: selectedRequest.id, donorId: donor.id });
    setDonors((ds) =>
      ds.map((d) =>
        d.id === donor.id
          ? { ...d, available: false }
          : d
      )
    );
    setShowConsent(false);
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: 'Request accepted. Points will be added after hospital confirms completed donation.' },
      ...n,
    ]);
  };

  const toggleAvailability = () => {
    if (isCooldownActive && !donor?.available) {
      setNotifications((n) => [
        {
          id: Date.now(),
          type: 'warning',
          text: `You can mark available after ${cooldownEndDate.toLocaleDateString()}. Recovery period is 2 months from donation date.`,
        },
        ...n,
      ]);
      return;
    }

    setDonors((ds) =>
      ds.map((d) =>
        d.id === donor.id ? { ...d, available: !d.available } : d
      )
    );
  };

  const handleReject = (request) => {
    rejectRequest({ requestId: request.id, donorId: donor.id, reason: 'Donor rejected request' });
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request declined. Hospital was notified.' },
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

  const stats = [
    { label: 'Points', value: donor.points || 0 },
    { label: 'LFT Tokens', value: donor.tokens || 0 },
    { label: 'Donation Records', value: donor.donationHistory?.length || 0 },
    { label: 'Urgent Matches', value: availableRequests.length },
  ];

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.95fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Donor Dashboard</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Stay ready for the next life-saving call.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Manage your availability, review matching requests, and keep your contact channels and reward progress up to date.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
                <div className="mt-2 text-4xl font-black">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Profile Summary */}
        <div className="section-card">
          <div className="blood-pill mb-4">Profile</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Donor Readiness</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-700 text-3xl font-bold text-white shadow-lg shadow-red-200">
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
            {isCooldownActive && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs font-semibold text-orange-800">
                Cooldown active until {cooldownEndDate.toLocaleDateString()}
              </div>
            )}
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
        <div className="section-card">
          <div className="blood-pill mb-4">Donation History</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Contributions</h2>
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

      {/* New Matching Requests */}
      <div className="section-card mb-8">
        <div className="blood-pill mb-4">Urgent Need</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">New Matching Requests</h2>
        <p className="mb-4 text-sm text-gray-600">Only active requests you can act on right now.</p>
        {availableRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-lg text-gray-600">No new actionable requests at the moment</p>
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

      {/* Blood Request History (Old + New) */}
      <div className="section-card mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="blood-pill mb-2">Timeline</div>
            <h2 className="text-2xl font-bold text-gray-900">Blood Request History</h2>
            <p className="mt-1 text-sm text-gray-600">Includes new, accepted, completed, expired, and previously seen requests.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Total: {donorRequestTimeline.length}
          </div>
        </div>

        {donorRequestTimeline.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No request records available for your blood group and location yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {donorRequestTimeline.map((req) => {
              const rejectedByMe = (req.donorRejections || []).some((rejection) => rejection.donorId === donor?.id);
              const acceptedByMe = req.acceptedBy === donor?.id;
              return (
                <div key={`history-${req.id}`}>
                  <RequestCard request={req} showActions={false} />
                  {(acceptedByMe || rejectedByMe) && (
                    <div className="mt-2 ml-2 text-xs font-semibold text-slate-600">
                      {acceptedByMe ? 'Your response: Accepted' : 'Your response: Rejected'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Preference Selector */}
      <div className="mb-8">
        <ContactPreferenceSelector />
      </div>

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
            You will be marked unavailable for 2 months after a confirmed donation. Our team will contact you shortly with pickup details.
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
