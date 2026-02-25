import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/mockData';
import NotificationService, { notificationServiceInstance } from '../services/NotificationService';
import { findBestMatches } from '../services/bloodMatchingService';

const AuthContext = createContext();

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

  const login = (email, password) => {
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
      meta: { email: user.email },
    };
    setAuditLogs((a) => [logEntry, ...a]);
    return { user };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const signup = (payload) => {
    const exists = users.find((u) => u.email === payload.email);
    if (exists) return { error: 'Email already registered' };
    
    if (!payload.password || payload.password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    const id = Date.now().toString();
    const user = { id, ...payload };
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
   * SENDS ONLY ONCE per donor via their chosen contact method
   * Also sends targeted emails to donors with matching blood groups via EmailJS
   */
  const sendNotificationsToMatchingDonors = async (request, donorsList) => {
    try {
      // Find best matching donors
      const matchingDonors = findBestMatches(request, donorsList, 10);

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

      // Send targeted blood group notifications via EmailJS (in background)
      sendBloodGroupNotifications(request, donorsList);

      // Show success notification
      if (successCount > 0) {
        setNotifications((n) => [
          {
            id: Date.now(),
            type: 'success',
            text: `✅ Notifications sent to ${successCount} matching donor(s) via email and SMS`,
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

  /**
   * Send targeted blood group emails via EmailJS
   * Sends beautiful emails only to donors with matching blood groups
   */
  const sendBloodGroupNotifications = async (request, donorsList) => {
    try {
      console.log(`🩸 Sending blood group notifications for ${request.bloodGroup}...`);
      
      // Call the new blood group notification method
      const result = await notificationServiceInstance.notifyDonorsByBloodGroup(donorsList, request);
      
      console.log(`✅ Blood group notifications completed: ${result.sent} sent, ${result.failed} failed`);
      
      if (result.sent > 0) {
        setNotifications((n) => [
          {
            id: Date.now(),
            type: 'success',
            text: `📧 ${result.sent} email notification(s) sent to ${request.bloodGroup} donors via EmailJS`,
          },
          ...n,
        ]);
      }
    } catch (error) {
      console.error('Error sending blood group notifications:', error);
      // Don't show error to user - this is a secondary notification system
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
    setNotifications((n) => [
      { id: Date.now(), type: 'warning', text: 'Request rejected' },
      ...n,
    ]);
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
