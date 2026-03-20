import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RequestCard from '../../components/RequestCard';
import DonorCard from '../../components/DonorCard';
import Modal from '../../components/Modal';

function calcComparibilityScore(req, donor) {
  let score = 0;
  if (req.bloodGroup === donor.bloodGroup) score += 50;
  if (req.location === donor.location) score += 25;
  if (donor.available) score += 25;
  return Math.min(100, score);
}

export default function HospitalDashboard() {
  const { currentUser, donors, requests, createRequest, completeRequest } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    quantity: 1,
    location: 'Downtown',
    urgency: 'medium',
    patientName: '',
    patientAge: 30,
    patientGender: 'male',
    reason: '',
    contactPerson: '',
  });

  const normalizeStatus = (status) => (status || '').toString().trim().toLowerCase();
  const getRequestId = (request) => request.id || request._id;
  const isMine = (request) => {
    const currentId = (currentUser?.id || '').toString();
    const hospitalId = (request.hospitalId || request.hospital || '').toString();
    return Boolean(currentId) && hospitalId === currentId;
  };

  const hospitalRequests = requests.filter(isMine);
  const sentRequests = hospitalRequests.filter((r) => ['sent', 'pending', 'accepted', 'in progress', 'in_progress'].includes(normalizeStatus(r.status)));
  const acceptedRequests = hospitalRequests.filter((r) => normalizeStatus(r.status) === 'accepted');
  const hospitalAlerts = hospitalRequests
    .flatMap((request) => (request.hospitalNotifications || []).map((alert) => ({ ...alert, requestId: request.id })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const request = await createRequest({
        ...formData,
        hospitalId: currentUser.id,
        hospitalName: currentUser.hospitalName || currentUser.name,
        quantity: parseInt(formData.quantity),
        phone: currentUser.phone,
      });
      
      // Wait a moment for notifications to be processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the updated request with notificationsSent from the requests array
      const updatedRequest = requests.find(r => r.id === request.id) || request;
      
      // Show notification status
      setNotificationStatus({
        success: true,
        message: `✅ Request created and saved! Notifications are sent only to matching donors (${request.bloodGroup}, ${request.location}).`,
        requestId: request.id,
        sentNotifications: updatedRequest.notificationsSent || [],
      });
      
      // Reset form
      setFormData({ bloodGroup: 'A+', quantity: 1, location: 'Downtown', urgency: 'medium', patientName: '', patientAge: 30, patientGender: 'male', reason: '', contactPerson: '' });
      
      // Close modal after delay
      setTimeout(() => {
        setShowCreateModal(false);
        setNotificationStatus(null);
      }, 4000);
    } catch (error) {
      setNotificationStatus({
        success: false,
        message: `Error creating request: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchingDonors = donors
    .filter((d) => {
      if (d.available !== true) return false;
      if (!d.cooldownActive || !d.nextEligibleDate) return true;
      return new Date(d.nextEligibleDate).getTime() <= Date.now();
    })
    .map((d) => ({
      ...d,
      score: calcComparibilityScore(formData, d),
    }))
    .sort((a, b) => b.score - a.score);

  const handleConfirmDonation = (request) => {
    completeRequest(getRequestId(request));
    setCompletionStatus(
      `Donation confirmed for ${request.bloodGroup} (${request.quantity} unit). Donor points are updated and donor is marked unavailable for 3 months.`
    );
    setTimeout(() => setCompletionStatus(null), 4000);
  };

  const dashboardStats = [
    { label: 'Active Requests', value: sentRequests.length },
    { label: 'Available Donors', value: donors.filter((d) => d.available).length },
    { label: 'My Requests', value: hospitalRequests.length },
    { label: 'Completed', value: hospitalRequests.filter((r) => normalizeStatus(r.status) === 'completed').length },
  ];

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <span className="blood-pill bg-white/12 text-white">Hospital Control Room</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Create requests and mobilize the right donors faster.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Monitor request demand, review donor matches, and keep the hospital-side response workflow focused and visible.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
                <div className="mt-2 text-4xl font-black">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Active Requests</p>
          <p className="text-3xl font-bold text-blue-600">{sentRequests.length}</p>
        </div>
        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Available Donors</p>
          <p className="text-3xl font-bold text-green-600">{donors.filter((d) => d.available).length}</p>
        </div>
        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">My Requests</p>
          <p className="text-3xl font-bold text-purple-600">{hospitalRequests.length}</p>
        </div>
        <div className="surface-metric">
          <p className="text-sm text-gray-600 font-semibold uppercase">Completed</p>
          <p className="text-3xl font-bold text-orange-600">{hospitalRequests.filter((r) => normalizeStatus(r.status) === 'completed').length}</p>
        </div>
      </div>

      {hospitalAlerts.length > 0 && (
        <div className="section-card mb-8 border-l-4 border-orange-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hospital Notifications</h2>
          <div className="space-y-3">
            {hospitalAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-semibold text-orange-900">{alert.message}</p>
                <p className="mt-1 text-xs text-orange-700">
                  Request ID: {alert.requestId} • {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {completionStatus && (
        <div className="section-card mb-8 border-l-4 border-emerald-500 bg-emerald-50">
          <p className="font-semibold text-emerald-900">✅ {completionStatus}</p>
        </div>
      )}

      {/* CREATE REQUEST - PROMINENT SECTION */}
      <div className="section-card mb-8 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🆘 Create Emergency Request</h2>
            <p className="text-gray-700 mb-2">Issue a blood request that will be sent to matching donors instantly</p>
            <div className="text-sm text-gray-600">
              <p>✅ Donors are notified based on blood group & location</p>
              <p>✅ Last request: <strong>{formData.bloodGroup}</strong> • <strong>{formData.quantity} units</strong></p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="action-primary px-8 py-4 text-lg font-bold whitespace-nowrap h-fit"
          >
            + New Request
          </button>
        </div>
      </div>

      {acceptedRequests.length > 0 && (
        <div className="section-card mb-8 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accepted Donations Pending Hospital Confirmation</h2>
          <div className="grid gap-4">
            {acceptedRequests.map((req) => (
              <div key={getRequestId(req)} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">
                      {req.bloodGroup} • {req.quantity} Unit(s) • {req.location}
                    </p>
                    <p className="text-sm text-blue-700">Accepted donor ID: {req.acceptedBy || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleConfirmDonation(req)}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Confirm Donation & Add Points
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Stats Card */}
        <div className="section-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Quick Stats</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Active Requests Network-wide</p>
              <p className="text-2xl font-bold text-blue-700">{sentRequests.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Donors Available Now</p>
              <p className="text-2xl font-bold text-green-700">{donors.filter((d) => d.available).length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">My Total Requests</p>
              <p className="text-2xl font-bold text-purple-700">{hospitalRequests.length}</p>
            </div>
          </div>
        </div>

        {/* Top Matching Donors */}
        <div className="section-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Top Matching Donors</h2>
          {matchingDonors.slice(0, 3).length === 0 ? (
            <p className="text-gray-600 text-center py-6">No available donors match this request</p>
          ) : (
            <div className="space-y-3">
              {matchingDonors.slice(0, 3).map((d) => (
                <div key={d.id} className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-600">{d.bloodGroup} • {d.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{d.score}%</p>
                      <p className="text-xs text-gray-600">Match</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Requests */}
      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Requests</h2>
        {hospitalRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-gray-600">No requests created yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {hospitalRequests.map((req) => (
              <RequestCard key={getRequestId(req)} request={req} showActions={false} />
            ))}
          </div>
        )}
      </div>

      {/* All Available Donors */}
      <div className="section-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Available Donors</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingDonors.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-gray-600">No available donors</p>
            </div>
          ) : (
            matchingDonors.map((d) => (
              <DonorCard
                key={d.id}
                donor={d}
                score={d.score}
                compatibility={{
                  bloodGroup: d.bloodGroup === formData.bloodGroup ? 'Blood group match' : null,
                  location: d.location === formData.location ? 'Same location' : null,
                  available: d.available ? 'Available now' : null,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNotificationStatus(null);
        }}
        title="Create Emergency Request"
        size="lg"
      >
        {notificationStatus && (
          <div
            className={`p-4 mb-4 rounded-lg border-l-4 ${
              notificationStatus.success
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-yellow-50 border-yellow-500 text-yellow-800'
            }`}
          >
            <p className="font-semibold">
              {notificationStatus.success ? '✅ Success!' : '⚠️ Notification Status'}
            </p>
            <p className="text-sm mt-2">{notificationStatus.message}</p>
            
            {notificationStatus.sentNotifications?.length > 0 && (
              <div className="mt-4 text-xs">
                <p className="font-semibold text-gray-700 mb-3">
                  📞 Donors Contacted ({notificationStatus.sentNotifications.filter(n => n.status === 'Sent').length}):
                </p>
                <div className="space-y-2 bg-white bg-opacity-50 rounded p-3">
                  {notificationStatus.sentNotifications.map((notif, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-green-200 last:border-0">
                      <div className="flex items-center space-x-2">
                        <span className={notif.status === 'Sent' ? '✅' : notif.status.startsWith('Skip') ? '⊘' : '❌'}>
                        </span>
                        <span className="font-medium">{notif.donorName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notif.method === 'sms' && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            📱 SMS
                          </span>
                        )}
                        {notif.method === 'email' && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            📧 Email
                          </span>
                        )}
                        <span className={`text-xs font-medium ${notif.status === 'Sent' ? 'text-green-700' : 'text-gray-600'}`}>
                          {notif.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
            <input
              type="text"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="input-shell"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Units Required</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="input-shell"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-shell"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="input-shell"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4">👤 Patient Details</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="e.g., Ram Kumar"
                className="input-shell"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  placeholder="e.g., 35"
                  className="input-shell"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  name="patientGender"
                  value={formData.patientGender}
                  onChange={handleChange}
                  className="input-shell"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Post-surgery recovery, Accident victim, etc."
                className="input-shell resize-none"
                rows="2"
                required
              ></textarea>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4">📞 Contact Person</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g., Dr. Sharma"
                className="input-shell"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>🩸 Smart Matching Notification:</strong> Only donors with exact blood group and city match will be notified via their chosen contact preference.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNotificationStatus(null);
              }}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="action-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
