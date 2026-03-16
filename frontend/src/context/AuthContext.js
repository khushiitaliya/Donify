import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/mockData';
import NotificationService from '../services/NotificationService';

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const raw = localStorage.getItem('donify_users');
    return raw ? JSON.parse(raw) : initialData.users;
  });
  
  const [donors, setDonors] = useState(() => {
    const raw = localStorage.getItem('donify_donors');
    return raw ? JSON.parse(raw) : initialData.donors;
  });
  
  const [hospitals, setHospitals] = useState(() => {
    const raw = localStorage.getItem('donify_hospitals');
    return raw ? JSON.parse(raw) : initialData.hospitals;
  });
  
  const [requests, setRequests] = useState(() => {
    const raw = localStorage.getItem('donify_requests');
    return raw ? JSON.parse(raw) : initialData.requests;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('donify_current');
    return raw ? JSON.parse(raw) : null;
  });
  
  const [notifications, setNotifications] = useState([]);
  
  const [auditLogs, setAuditLogs] = useState(() => {
    const raw = localStorage.getItem('donify_audits');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem('donify_users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('donify_donors', JSON.stringify(donors));
  }, [donors]);
  
  useEffect(() => {
    localStorage.setItem('donify_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);
  
  useEffect(() => {
    localStorage.setItem('donify_requests', JSON.stringify(requests));
  }, [requests]);
  
  useEffect(() => {
    localStorage.setItem('donify_current', JSON.stringify(currentUser));
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('donify_audits', JSON.stringify(auditLogs));
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
        setNotifications((n) => [
          { id: Date.now(), type: 'success', text: `Welcome back, ${user.name || user.hospitalName || 'User'}!` },
          ...n,
        ]);

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
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: `Welcome back, ${user.name || user.hospitalName}!` },
      ...n,
    ]);
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

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.message || data?.errors?.[0]?.msg || 'Registration failed';
        return { error: errorMessage };
      }

      if (data.token) {
        localStorage.setItem('donify_token', data.token);
      }

      const id = data.user?.id || Date.now().toString();
      const user = {
        id,
        ...payload,
        role: payload.role,
      };

      setUsers((u) => [user, ...u]);

      if (payload.role === 'Donor') {
        setDonors((d) => [
          {
            id,
            name: payload.name,
            age: payload.age,
            bloodGroup: payload.bloodGroup,
            location: payload.location,
            contact: payload.contact,
            lastDonationDate: payload.lastDonationDate || null,
            nextEligibleDate: payload.lastDonationDate ? new Date(new Date(payload.lastDonationDate).getTime() + 56 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
            available: true,
            points: 0,
            badges: [],
            donationHistory: [],
          },
          ...d,
        ]);
      }

      if (payload.role === 'Hospital') {
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

      return { user };
    } catch (error) {
      return { error: 'Backend is not reachable. Please ensure backend is running.' };
    }
  };

  const createRequest = (req) => {
    const request = {
      id: Date.now().toString(),
      status: 'Sent',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      notificationsSent: [],
      ...req,
    };
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
   * Send notifications to matching donors for a blood request
   * Sends exactly once per request and only to donors with the exact required blood group.
   */
  const sendNotificationsToMatchingDonors = async (request, donorsList) => {
    try {
      const matchingDonors = donorsList.filter((donor) => {
        const hasContact = donor.contactPreference && (donor.phone || donor.email);
        const exactBloodGroupMatch = donor.bloodGroup === request.bloodGroup;
        const isAvailable = donor.available !== false;
        return hasContact && exactBloodGroupMatch && isAvailable;
      });

      if (matchingDonors.length === 0) {
        console.log('No matching donors found for request:', request.bloodGroup);
        setNotifications((n) => [
          { id: Date.now(), type: 'warning', text: `⚠️ No matching donors found for ${request.bloodGroup}` },
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
            text: `✅ Notifications sent to ${successCount} donor(s) with blood group ${request.bloodGroup}`,
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

  const rejectRequest = (requestId) => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Rejected', rejectedAt: new Date().toISOString() }
          : r
      )
    );
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request rejected' },
      ...n,
    ]);
    const logEntry = {
      id: Date.now().toString(),
      type: 'reject_request',
      timestamp: new Date().toISOString(),
      meta: { requestId },
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
    setRequests((rs) =>
      rs.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Completed', completedAt: new Date().toISOString() }
          : r
      )
    );
    setNotifications((n) => [
      { id: Date.now(), type: 'success', text: 'Request completed successfully!' },
      ...n,
    ]);
    const logEntry = {
      id: Date.now().toString(),
      type: 'complete',
      timestamp: new Date().toISOString(),
      meta: { requestId },
    };
    setAuditLogs((a) => [logEntry, ...a]);
  };

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
    sendNotificationsToMatchingDonors,
    setNotifications,
    setDonors,
    setRequests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
