import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';

export default function TestNotificationPanel() {
  const { currentUser, setNotifications } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const sendTestNotification = async () => {
    if (!currentUser || currentUser.role !== 'Donor') return;

    setIsSending(true);
    try {
      // Create a test request
      const testRequest = {
        id: `test_${Date.now()}`,
        bloodGroup: 'O+',
        quantity: 2,
        location: 'Test Hospital',
        urgency: 'High',
        hospitalName: 'TEST Hospital (Demo)',
      };

      // Get notification service
      const service = new NotificationService();

      let result;
      const subject = service.generateEmailSubject(testRequest);
      const content = service.generateEmailContent(currentUser, testRequest);

      // Send based on preference
      if (currentUser.contactPreference === 'email' && currentUser.email) {
        result = await service.sendEmail(currentUser.email, subject, content);
        setLogs((prev) => [
          {
            id: Date.now(),
            type: 'email',
            target: currentUser.email,
            status: result.status,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      } else if (currentUser.contactPreference === 'phone' && currentUser.phone) {
        const message = service.generateSMSMessage(testRequest);
        result = await service.sendSMS(currentUser.phone, message);
        setLogs((prev) => [
          {
            id: Date.now(),
            type: 'sms',
            target: currentUser.phone,
            status: result.status,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }

      setNotifications((n) => [
        {
          id: Date.now(),
          type: 'info',
          text: `📧 Test notification sent via ${currentUser.contactPreference}!`,
        },
        ...n,
      ]);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setNotifications((n) => [
        {
          id: Date.now(),
          type: 'error',
          text: `❌ Error: ${error.message}`,
        },
        ...n,
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentUser || currentUser.role !== 'Donor') {
    return null;
  }

  return (
    <div className="section-card mb-8 border-purple-100/60">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="blood-pill mb-2">Delivery Check</div>
          <h2 className="text-xl font-bold text-gray-900">🧪 Test Notifications</h2>
        </div>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="rounded-full bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-200"
        >
          {showLogs ? 'Hide' : 'Show'} Logs
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Send yourself a test blood request notification to verify email/SMS delivery is working correctly.
      </p>

      <div className="flex space-x-3">
        <button
          onClick={sendTestNotification}
          disabled={isSending || (!currentUser.email && !currentUser.phone)}
          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${
            isSending || (!currentUser.email && !currentUser.phone)
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 rounded-full'
          }`}
        >
          {isSending ? '⏳ Sending...' : '📨 Send Test Notification'}
        </button>
      </div>

      {!currentUser.email && !currentUser.phone && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Setup Required:</strong> You need to add at least an email or phone number in "Edit Contact Info" before sending test notifications.
          </p>
        </div>
      )}

      {showLogs && (
        <div className="mt-6 pt-6 border-t-2 border-purple-200">
          <h3 className="font-bold text-gray-900 mb-3">📋 Notification Logs</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-600">No test notifications sent yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded text-xs font-mono ${
                    log.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : log.status === 'demo' || log.status === 'demo_fallback'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">
                      {log.type === 'email' ? '📧 Email' : '📱 SMS'} - {log.time}
                    </span>
                    <span className="uppercase">
                      {log.status === 'sent'
                        ? '✅ SENT'
                        : log.status === 'demo' || log.status === 'demo_fallback'
                        ? '🔄 DEMO MODE'
                        : '❌ FAILED'}
                    </span>
                  </div>
                  <div className="text-xs opacity-75">To: {log.target}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-xs text-blue-800 mb-2">
          <strong>💡 How to Enable Real Email Notifications:</strong>
        </p>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Sign up free at <strong>emailjs.com</strong></li>
          <li>Create a service (Gmail or any email provider)</li>
          <li>Get your Service ID, Template ID, and Public Key</li>
          <li>Add to .env: <code>REACT_APP_EMAILJS_SERVICE_ID</code>, <code>REACT_APP_EMAILJS_TEMPLATE_ID</code>, <code>REACT_APP_EMAILJS_PUBLIC_KEY</code></li>
          <li>Restart the app - emails will now be sent for real!</li>
        </ol>
      </div>
    </div>
  );
}
