import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/mockData';
import NotificationService from '../services/NotificationService';
import { createMintTransaction, createRedeemTransaction, TOKENS_PER_DONATION, getBadgesForPoints } from '../services/blockchainService';

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

export const useAuth = () => useContext(AuthContext);

const STORAGE_VERSION = 'v2';

const getVersionedKey = (key) => `${key}_${STORAGE_VERSION}`;
const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

// Clear any old-version keys so stale demo data never blocks fresh defaults.
['donify_users', 'donify_donors', 'donify_hospitals', 'donify_requests', 'donify_audits'].forEach((key) => {
  if (localStorage.getItem(key) !== null) {
    localStorage.removeItem(key);
  }
});

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_users'));
    return raw ? JSON.parse(raw) : initialData.users;
  });
  
  const [donors, setDonors] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_donors'));
    return raw ? JSON.parse(raw) : initialData.donors;
  });
  
  const [hospitals, setHospitals] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_hospitals'));
    return raw ? JSON.parse(raw) : initialData.hospitals;
  });
  
  const [requests, setRequests] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_requests'));
    return raw ? JSON.parse(raw) : initialData.requests;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_current'));
    return raw ? JSON.parse(raw) : null;
  });
  
  const [notifications, setNotifications] = useState([]);
  
  const [auditLogs, setAuditLogs] = useState(() => {
    const raw = localStorage.getItem(getVersionedKey('donify_audits'));
    return raw ? JSON.parse(raw) : [];
  });

  const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

  const addMonthsToISOString = (isoDate, months) => {
    const date = new Date(isoDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  const isDonorRequestEligible = (donor, referenceDate = new Date()) => {
    if (donor.available !== true) return false;
    if (!donor.cooldownActive) return true;
    if (!donor.nextEligibleDate) return false;
    return new Date(donor.nextEligibleDate).getTime() <= referenceDate.getTime();
  };
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_users'), JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_donors'), JSON.stringify(donors));
  }, [donors]);
  
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_hospitals'), JSON.stringify(hospitals));
  }, [hospitals]);
  
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_requests'), JSON.stringify(requests));
  }, [requests]);
  
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_current'), JSON.stringify(currentUser));
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem(getVersionedKey('donify_audits'), JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Keep MongoDB synchronized with data previously stored in localStorage.
  useEffect(() => {
    const controller = new AbortController();

    const syncLocalDataToBackend = async () => {
      try {
        await fetch(`${API_BASE}/api/auth/sync-local-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users, donors, hospitals, requests }),
          signal: controller.signal,
        });
      } catch (error) {
        // Ignore sync errors in UI; backend availability can vary during local dev.
        console.warn('Local data sync skipped:', error.message);
      }
    };

    const timeout = setTimeout(syncLocalDataToBackend, 500);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [users, donors, hospitals, requests]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('donify_token', data.token);
        }

        const user = data.user;
        setCurrentUser(user);

        const logEntry = {
          id: Date.now().toString(),
          type: 'login',
          by: user.id,
          timestamp: new Date().toISOString(),
          meta: { email: user.email, source: 'backend' },
        };
        setAuditLogs((a) => [logEntry, ...a]);
        return { user };
      }
    } catch (error) {
      // Fall back to legacy local login.
    }

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return { error: 'Invalid email or password' };

    setCurrentUser(user);
    const logEntry = {
      id: Date.now().toString(),
      type: 'login',
      by: user.id,
      timestamp: new Date().toISOString(),
      meta: { email: user.email, source: 'local' },
    };
    setAuditLogs((a) => [logEntry, ...a]);
    return { user };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const signup = async (payload) => {
    const exists = users.find((u) => u.email === payload.email);
    if (exists) return { error: 'Email already registered' };

    if (!payload.password || payload.password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    const normalizedRole = payload.role === 'Hospital' ? 'hospital' : 'donor';
    const registerPayload = {
      name: payload.role === 'Hospital' ? payload.hospitalName : payload.name,
      email: payload.email,
      password: payload.password,
      role: normalizedRole,
      phone: payload.contact,
      location: payload.location,
      bloodGroup: payload.bloodGroup,
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (_parseError) {
        data = null;
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.errors?.[0]?.msg ||
          (raw && raw.trim()) ||
          `Registration failed (HTTP ${response.status})`;
        return { error: errorMessage };
      }

      if (data.token) {
        localStorage.setItem('donify_token', data.token);
      }

      const id = data.user?.id || Date.now().toString();
      const role = normalizeRole(data.user?.role || payload.role);
      const user = {
        id,
        ...payload,
        role,
      };

      const backendUser = data.user
        ? {
            ...data.user,
            role,
          }
        : null;

      if (backendUser) {
        setCurrentUser(backendUser);
      }

      setUsers((u) => [user, ...u]);

      if (role === 'donor') {
        setDonors((d) => [
          {
            id,
            name: payload.name,
            age: payload.age,
            bloodGroup: payload.bloodGroup,
            location: payload.location,
            phone: payload.contact || '',
            email: payload.email || '',
            contact: payload.contact,
            lastDonationDate: payload.lastDonationDate || null,
            nextEligibleDate: null,
            cooldownActive: false,
            availabilityRestoreNotifiedAt: null,
            available: true,
            points: 0,
            badges: [],
            tokens: 0,
            tokenTransactions: [],
            donationHistory: [],
          },
          ...d,
        ]);
      }

      if (role === 'hospital') {
        setHospitals((h) => [
          {
            id,
            name: payload.hospitalName,
            location: payload.location,
            contact: payload.contact,
            email: payload.email,
            createdAt: new Date().toISOString(),
          },
          ...h,
        ]);
      }

      return { user: backendUser || user };
    } catch (error) {
      if (error?.name === 'TypeError') {
        return { error: 'Backend is not reachable. Please ensure backend is running.' };
      }
      return { error: error?.message || 'Registration failed unexpectedly.' };
    }
  };

  const createRequest = async (req) => {
    const request = {
      id: Date.now().toString(),
      status: 'Sent',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      notificationsSent: [],
      hospitalNotifications: [],
      ...req,
    };
    
    // Save to backend MongoDB
    try {
      const token = localStorage.getItem('donify_token');
      const requestPayload = {
        bloodGroup: request.bloodGroup,
        quantity: request.quantity,
        urgency: request.urgency || 'medium',
        location: request.location,
        patientName: request.patientName || 'Unknown',
        patientAge: request.patientAge || 30,
        patientGender: request.patientGender || 'other',
        reason: request.reason || 'Urgent blood requirement',
        contactPerson: request.contactPerson || currentUser?.name || 'Hospital',
        contactPhone: request.phone || currentUser?.phone || '9999999999'
      };

      const response = await fetch(`${API_BASE}/api/hospitals/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Blood request saved to MongoDB:', data);
      } else {
        console.warn('Failed to save blood request to backend, but creating locally');
      }
    } catch (error) {
      console.warn('Backend blood request save failed:', error.message);
    }
    
    setRequests((s) => [request, ...s]);
    setNotifications((n) => [
      { id: Date.now(), type: 'info', text: `Emergency request: ${request.bloodGroup} ${request.quantity}U needed` },
      ...n,
    ]);
    
    const logEntry = {
      id: Date.now().toString(),
      type: 'create_request',
      by: req.hospitalId,
      timestamp: new Date().toISOString(),
      meta: { requestId: request.id, bloodGroup: request.bloodGroup, quantity: request.quantity },
    };
    setAuditLogs((a) => [logEntry, ...a]);

    // Send notifications to matching donors
    sendNotificationsToMatchingDonors(request, donors);

    return request;
  };

  /**
   * Send notifications to matching donors for a blood request.
   * Sends exactly once per request and only to donors with exact blood group + city match.
   */
  const sendNotificationsToMatchingDonors = async (request, donorsList) => {
    try {
      const matchingDonors = donorsList.filter((donor) => {
        const hasContact = donor.contactPreference && (donor.phone || donor.email);
        const exactBloodGroupMatch = normalizeText(donor.bloodGroup) === normalizeText(request.bloodGroup);
        const exactCityMatch = normalizeText(donor.location) === normalizeText(request.location);
        const isEligibleNow = isDonorRequestEligible(donor);
        return hasContact && exactBloodGroupMatch && exactCityMatch && isEligibleNow;
      });

      if (matchingDonors.length === 0) {
        console.log('No matching donors found for request:', request.bloodGroup, request.location);
        setRequests((rs) =>
          rs.map((r) =>
            r.id === request.id
              ? {
                  ...r,
                  hospitalNotifications: [
                    ...(r.hospitalNotifications || []),
                    {
                      id: `${Date.now()}-no-match`,
                      type: 'no_matching_donor',
                      message: `No available donor found for ${request.bloodGroup} in ${request.location}.`,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : r
          )
        );
        setNotifications((n) => [
          { id: Date.now(), type: 'warning', text: `⚠️ No matching donors found for ${request.bloodGroup} in ${request.location}` },
          ...n,
        ]);
        return;
      }

      let notificationsSent = [];
      let successCount = 0;

      for (const donor of matchingDonors) {
        // Skip if no contact preference set
        if (!donor.contactPreference || (!donor.phone && !donor.email)) {
          continue;
        }

        try {
          // Notify donor via their chosen contact method (ONCE only)
          const result = await NotificationService.notifyDonor(donor, request);
          
          if (result.success) {
            notificationsSent.push({
              donorId: donor.id,
              donorName: donor.name,
              status: 'Sent',
              method: result.method, // 'sms' or 'email'
              timestamp: new Date().toISOString(),
            });

            // Mark donor as notified for this request
            setDonors((ds) =>
              ds.map((d) =>
                d.id === donor.id
                  ? {
                      ...d,
                      notifiedRequests: [...(d.notifiedRequests || []), request.id],
                      notificationHistory: [
                        ...(d.notificationHistory || []),
                        {
                          requestId: request.id,
                          bloodGroup: request.bloodGroup,
                          location: request.location,
                          method: result.method,
                          timestamp: new Date().toISOString(),
                        },
                      ],
                    }
                  : d
              )
            );
            successCount++;
          } else if (result.reason === 'already_notified') {
            notificationsSent.push({
              donorId: donor.id,
              donorName: donor.name,
              status: 'Already Notified',
              timestamp: new Date().toISOString(),
            });
          } else if (result.reason === 'no_contact_info') {
            notificationsSent.push({
              donorId: donor.id,
              donorName: donor.name,
              status: 'Skipped - No Valid Contact Info',
              timestamp: new Date().toISOString(),
            });
          } else {
            notificationsSent.push({
              donorId: donor.id,
              donorName: donor.name,
              status: 'Failed',
              error: result.error,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error notifying donor ${donor.id}:`, error);
          notificationsSent.push({
            donorId: donor.id,
            donorName: donor.name,
            status: 'Failed',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Update request with notification status
      setRequests((rs) =>
        rs.map((r) =>
          r.id === request.id 
            ? { 
                ...r, 
                notificationsSent,
                notifiedCount: successCount,
                notifiedFilters: {
                  bloodGroup: request.bloodGroup,
                  location: request.location,
                },
              } 
            : r
        )
      );

      // Show success notification
      if (successCount > 0) {
        setNotifications((n) => [
          {
            id: Date.now(),
            type: 'success',
            text: `✅ Notifications sent to ${successCount} donor(s) for ${request.bloodGroup} in ${request.location}`,
          },
          ...n,
        ]);
      } else {
        setNotifications((n) => [
          {
            id: Date.now(),
            type: 'info',
            text: '📋 No donors with valid contact information available for notification',
          },
          ...n,
        ]);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      setNotifications((n) => [
        {
          id: Date.now(),
          type: 'error',
          text: '❌ Error sending notifications to donors',
        },
        ...n,
      ]);
    }
  };

  const acceptRequest = ({ requestId, donorId }) => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Accepted',
              acceptedBy: donorId,
              acceptedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setDonors((ds) =>
      ds.map((d) =>
        d.id === donorId ? { ...d, available: false } : d
      )
    );
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: `Request accepted! Donor is on the way.` },
      ...n,
    ]);
    const logEntry = {
      id: Date.now().toString(),
      type: 'accept_request',
      by: donorId,
      timestamp: new Date().toISOString(),
      meta: { requestId, donorId },
    };
    setAuditLogs((a) => [logEntry, ...a]);
  };

  const rejectRequest = (input) => {
    const requestId = typeof input === 'string' ? input : input?.requestId;
    const donorId = typeof input === 'string' ? null : input?.donorId;
    const reason = typeof input === 'string' ? 'Donor unavailable' : input?.reason || 'Donor unavailable';
    const donor = donors.find((d) => d.id === donorId);
    const donorName = donor?.name || 'A donor';
    const eventTime = new Date().toISOString();

    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? {
              ...r,
              // Keep request open so other matching donors can still accept.
              status: r.status === 'Sent' ? 'Sent' : r.status,
              donorRejections: [
                ...(r.donorRejections || []),
                {
                  donorId,
                  donorName,
                  reason,
                  timestamp: eventTime,
                },
              ],
              hospitalNotifications: [
                ...(r.hospitalNotifications || []),
                {
                  id: `${Date.now()}-${donorId || 'unknown'}`,
                  type: 'donor_unavailable',
                  donorId,
                  donorName,
                  message: `${donorName} is not available for request ${r.bloodGroup} in ${r.location}.`,
                  timestamp: eventTime,
                },
              ],
            }
          : r
      )
    );
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request declined. Hospital has been notified that you are unavailable.' },
      ...n,
    ]);
    const logEntry = {
      id: Date.now().toString(),
      type: 'reject_request',
      by: donorId,
      timestamp: new Date().toISOString(),
      meta: { requestId, donorId, reason },
    };
    setAuditLogs((a) => [logEntry, ...a]);
  };

  const markInProgress = (requestId) => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? { ...r, status: 'In Progress', inProgressAt: new Date().toISOString() }
          : r
      )
    );
    const logEntry = {
      id: Date.now().toString(),
      type: 'in_progress',
      timestamp: new Date().toISOString(),
      meta: { requestId },
    };
    setAuditLogs((a) => [logEntry, ...a]);
  };

  const completeRequest = (requestId) => {
    const targetRequest = requests.find((r) => r.id === requestId);
    if (!targetRequest || targetRequest.status === 'Completed') {
      return;
    }

    const completedAt = new Date().toISOString();
    const nextEligibleDate = addMonthsToISOString(completedAt, 3);
    const pointsAwarded = 10;
    const donorId = targetRequest.acceptedBy;

    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Completed', completedAt }
          : r
      )
    );

    if (donorId) {
      setDonors((ds) =>
        ds.map((d) => {
          if (d.id !== donorId) return d;
          const newPoints = (d.points || 0) + pointsAwarded;
          const mintTx = createMintTransaction({
            donorId: d.id,
            donorName: d.name,
            requestId,
            amount: TOKENS_PER_DONATION,
          });
          const txEntry = {
            id: `${Date.now()}-${requestId}`,
            requestId,
            date: completedAt,
            hospital: targetRequest.hospitalName || 'Hospital',
            units: targetRequest.quantity || 1,
            txHash: mintTx.txHash,
          };
          return {
            ...d,
            lastDonationDate: completedAt,
            nextEligibleDate,
            cooldownActive: true,
            availabilityRestoreNotifiedAt: null,
            available: false,
            points: newPoints,
            badges: getBadgesForPoints(newPoints),
            tokens: (d.tokens || 0) + TOKENS_PER_DONATION,
            tokenTransactions: [mintTx, ...(d.tokenTransactions || [])],
            donationHistory: [txEntry, ...(d.donationHistory || [])],
          };
        })
      );
    }

    setNotifications((n) => [
      {
        id: Date.now(),
        type: 'success',
        text: donorId
          ? `Donation confirmed! Donor awarded +${pointsAwarded} pts & +${TOKENS_PER_DONATION} LFT tokens. Unavailable until ${new Date(nextEligibleDate).toLocaleDateString()}.`
          : 'Request completed successfully!',
      },
      ...n,
    ]);
    const logEntry = {
      id: Date.now().toString(),
      type: 'complete',
      timestamp: completedAt,
      meta: { requestId, donorId, pointsAwarded: donorId ? pointsAwarded : 0, tokensAwarded: donorId ? TOKENS_PER_DONATION : 0 },
    };
    setAuditLogs((a) => [logEntry, ...a]);
  };

  const redeemReward = ({ donorId, reward }) => {
    let success = false;
    setDonors((ds) =>
      ds.map((d) => {
        if (d.id !== donorId) return d;
        if ((d.tokens || 0) < reward.cost) return d; // insufficient tokens
        const redeemTx = createRedeemTransaction({
          donorId: d.id,
          donorName: d.name,
          rewardId: reward.id,
          rewardName: reward.name,
          amount: reward.cost,
        });
        success = true;
        return {
          ...d,
          tokens: (d.tokens || 0) - reward.cost,
          tokenTransactions: [redeemTx, ...(d.tokenTransactions || [])],
          redeemedRewards: [
            { rewardId: reward.id, rewardName: reward.name, redeemedAt: redeemTx.timestamp, txHash: redeemTx.txHash },
            ...(d.redeemedRewards || []),
          ],
        };
      })
    );

    if (success) {
      setNotifications((n) => [
        { id: Date.now(), type: 'success', text: `🎉 Redeemed "${reward.name}" for ${reward.cost} LFT tokens!` },
        ...n,
      ]);
    } else {
      setNotifications((n) => [
        { id: Date.now(), type: 'error', text: `❌ Insufficient LFT tokens to redeem "${reward.name}".` },
        ...n,
      ]);
    }
    return success;
  };

  // Auto-restore donor availability when 2-month cooldown completes.
  useEffect(() => {
    const restoreEligibleDonors = () => {
      const now = new Date();
      const restoredDonors = [];

      setDonors((ds) =>
        ds.map((d) => {
          if (!d.cooldownActive || !d.nextEligibleDate) {
            return d;
          }

          const cooldownCompleted = new Date(d.nextEligibleDate).getTime() <= now.getTime();
          if (!cooldownCompleted) {
            return d;
          }

          restoredDonors.push(d.name || d.id);
          return {
            ...d,
            available: true,
            cooldownActive: false,
            availabilityRestoreNotifiedAt: now.toISOString(),
          };
        })
      );

      if (restoredDonors.length > 0) {
        setNotifications((n) => [
          {
            id: Date.now(),
            type: 'info',
            text: `🩸 ${restoredDonors.join(', ')} can donate again now after the 2-month recovery period.`,
          },
          ...n,
        ]);

        const logEntry = {
          id: Date.now().toString(),
          type: 'auto_restore_availability',
          timestamp: now.toISOString(),
          meta: { donorNames: restoredDonors },
        };
        setAuditLogs((a) => [logEntry, ...a]);
      }
    };

    restoreEligibleDonors();
    const interval = setInterval(restoreEligibleDonors, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cancelRequest = (requestId) => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Cancelled', cancelledAt: new Date().toISOString() }
          : r
      )
    );
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request cancelled' },
      ...n,
    ]);
  };

  // Auto-expire requests older than 48 hours
  useEffect(() => {
    const expireOldRequests = () => {
      const now = Date.now();
      setRequests((rs) =>
        rs.map((r) => {
          const createdTime = new Date(r.createdAt).getTime();
          if (
            r.status === 'Sent' &&
            now - createdTime > 48 * 60 * 60 * 1000
          ) {
            return { ...r, status: 'Expired', expiredAt: new Date().toISOString() };
          }
          return r;
        })
      );
    };

    expireOldRequests();
    const interval = setInterval(expireOldRequests, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, []);

  const value = {
    users,
    donors,
    hospitals,
    requests,
    currentUser,
    notifications,
    auditLogs,
    login,
    logout,
    signup,
    createRequest,
    acceptRequest,
    rejectRequest,
    markInProgress,
    completeRequest,
    cancelRequest,
    redeemReward,
    sendNotificationsToMatchingDonors,
    setNotifications,
    setDonors,
    setRequests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
