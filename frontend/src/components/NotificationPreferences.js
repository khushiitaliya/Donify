import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NotificationPreferences() {
  const { currentUser, setDonors } = useAuth();
  const [preferences, setPreferences] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    urgencyFilter: 'All', // All, High, Critical
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem('donify_notification_prefs');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e) => {
    const { name, checked, value } = e.target;
    const newPref = {
      ...preferences,
      [name]: name === 'urgencyFilter' ? value : checked,
    };
    setPreferences(newPref);
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('donify_notification_prefs', JSON.stringify(preferences));

    // Update donor with notification preferences
    if (currentUser && currentUser.role === 'Donor') {
      setDonors((ds) =>
        ds.map((d) =>
          d.id === currentUser.id
            ? { ...d, notificationPreferences: preferences }
            : d
        )
      );
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!currentUser || currentUser.role !== 'Donor') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Only donors can manage notification preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Customize how you receive blood request alerts</p>
      </div>

      <div className="space-y-6">
        {/* SMS Notification */}
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms"
                  name="sms"
                  checked={preferences.sms}
                  onChange={handleChange}
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                />
                <label htmlFor="sms" className="cursor-pointer">
                  <h3 className="font-bold text-gray-900">📱 SMS Notifications</h3>
                </label>
              </div>
              <p className="text-gray-600 text-sm mt-1 ml-7">
                Receive urgent blood requests via SMS text messages
              </p>
              {preferences.sms && (
                <p className="text-green-600 text-sm mt-2 ml-7 font-medium">
                  ✓ Enabled - You'll receive SMS alerts
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Notification */}
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whatsapp"
                  name="whatsapp"
                  checked={preferences.whatsapp}
                  onChange={handleChange}
                  className="w-5 h-5 accent-green-600 cursor-pointer"
                />
                <label htmlFor="whatsapp" className="cursor-pointer">
                  <h3 className="font-bold text-gray-900">💬 WhatsApp Messages</h3>
                </label>
              </div>
              <p className="text-gray-600 text-sm mt-1 ml-7">
                Get blood requests instantly on WhatsApp with quick reply options
              </p>
              {preferences.whatsapp && (
                <p className="text-green-600 text-sm mt-2 ml-7 font-medium">
                  ✓ Enabled - You'll receive WhatsApp messages
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email"
                  name="email"
                  checked={preferences.email}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="email" className="cursor-pointer">
                  <h3 className="font-bold text-gray-900">📧 Email Notifications</h3>
                </label>
              </div>
              <p className="text-gray-600 text-sm mt-1 ml-7">
                Receive detailed blood request information via email
              </p>
              {preferences.email && (
                <p className="text-green-600 text-sm mt-2 ml-7 font-medium">
                  ✓ Enabled - You'll receive email alerts
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Urgency Filter */}
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h3 className="font-bold text-gray-900 mb-3">🎯 Request Urgency Filter</h3>
          <p className="text-gray-600 text-sm mb-4">
            Only receive notifications for requests with urgency level:
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="urgencyFilter"
                value="All"
                checked={preferences.urgencyFilter === 'All'}
                onChange={handleChange}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-gray-700">All requests (No filter)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="urgencyFilter"
                value="High"
                checked={preferences.urgencyFilter === 'High'}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-600"
              />
              <span className="text-gray-700">High & Critical only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="urgencyFilter"
                value="Critical"
                checked={preferences.urgencyFilter === 'Critical'}
                onChange={handleChange}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-gray-700">Critical only</span>
            </label>
          </div>
        </div>

        {/* Active Channels Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Active Notification Channels:</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.sms && (
              <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                📱 SMS
              </span>
            )}
            {preferences.whatsapp && (
              <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-medium">
                💬 WhatsApp
              </span>
            )}
            {preferences.email && (
              <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-sm font-medium">
                📧 Email
              </span>
            )}
            {!preferences.sms && !preferences.whatsapp && !preferences.email && (
              <span className="bg-gray-200 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                ⚠️ No channels enabled
              </span>
            )}
          </div>
        </div>

        {/* Save and Status Messages */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {saved && (
              <p className="text-green-600 font-medium text-sm">
                ✓ Preferences saved successfully!
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!preferences.sms && !preferences.whatsapp && !preferences.email}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Preferences
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Enable at least one notification channel to receive blood requests
        </p>
      </div>
    </div>
  );
}
