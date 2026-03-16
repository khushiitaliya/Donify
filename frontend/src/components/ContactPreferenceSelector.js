import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ContactPreferenceSelector() {
  const { currentUser, setDonors, donors } = useAuth();
  const donor = donors.find((d) => d.id === currentUser?.id);
  const [preference, setPreference] = useState('phone');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved preference
    if (donor?.contactPreference) {
      setPreference(donor.contactPreference);
    }
  }, [donor]);

  const handleSave = () => {
    setDonors((ds) =>
      ds.map((d) =>
        d.id === currentUser.id
          ? { ...d, contactPreference: preference }
          : d
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!currentUser || currentUser.role !== 'Donor') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📞 How to Receive Blood Requests?
        </h2>
        <p className="text-gray-600">Choose your preferred contact method. We'll notify you only through this channel when hospitals need your blood type.</p>
      </div>

      <div className="space-y-4">
        {/* Phone Option */}
        <div
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            preference === 'phone'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300'
          }`}
          onClick={() => setPreference('phone')}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="phone"
                  name="contact"
                  value="phone"
                  checked={preference === 'phone'}
                  onChange={() => setPreference('phone')}
                  className="w-5 h-5 cursor-pointer accent-blue-600"
                />
                <label htmlFor="phone" className="cursor-pointer">
                  <h3 className="font-bold text-lg text-gray-900">📱 Phone / SMS</h3>
                </label>
              </div>
              <p className="text-gray-600 text-sm">
                Receive urgent blood request alerts via SMS to your mobile phone
              </p>
              {donor?.phone && (
                <p className="text-blue-600 text-sm font-mono mt-2">
                  📲 {donor.phone}
                </p>
              )}
              {!donor?.phone && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Phone number not updated. Update your profile to add phone number.
                </p>
              )}
            </div>
            {preference === 'phone' && (
              <span className="text-3xl text-blue-600">✓</span>
            )}
          </div>
        </div>

        {/* Email Option */}
        <div
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            preference === 'email'
              ? 'border-green-600 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-green-300'
          }`}
          onClick={() => setPreference('email')}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="email"
                  name="contact"
                  value="email"
                  checked={preference === 'email'}
                  onChange={() => setPreference('email')}
                  className="w-5 h-5 cursor-pointer accent-green-600"
                />
                <label htmlFor="email" className="cursor-pointer">
                  <h3 className="font-bold text-lg text-gray-900">📧 Email</h3>
                </label>
              </div>
              <p className="text-gray-600 text-sm">
                Receive detailed blood request information via email with action links
              </p>
              {donor?.email && (
                <p className="text-green-600 text-sm font-mono mt-2">
                  📧 {donor.email}
                </p>
              )}
              {!donor?.email && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Email address not set. Update your profile.
                </p>
              )}
            </div>
            {preference === 'email' && (
              <span className="text-3xl text-green-600">✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>ℹ️ Important:</strong> You will receive <strong>one notification per blood request</strong>. 
          Only choose this method if you have a valid phone number or email. We'll never spam you - only urgent blood requests matching your blood type will be sent.
        </p>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {saved && (
            <p className="text-green-600 font-medium text-sm flex items-center space-x-2">
              <span>✅ Preference saved!</span>
            </p>
          )}
          {preference === 'phone' && donor?.phone && (
            <p className="text-blue-600 text-sm">
              Your SMS notification preference is active
            </p>
          )}
          {preference === 'email' && donor?.email && (
            <p className="text-green-600 text-sm">
              Your email notification preference is active
            </p>
          )}
          {((!donor?.phone && preference === 'phone') || (!donor?.email && preference === 'email')) && (
            <p className="text-red-600 text-sm">
              ⚠️ Please update your contact information first
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={
            (preference === 'phone' && !donor?.phone) ||
            (preference === 'email' && !donor?.email)
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Preference
        </button>
      </div>
    </div>
  );
}
