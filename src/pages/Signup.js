import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [role, setRole] = useState('Donor');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      role,
      email: formData.email,
      password: formData.password,
    };

    if (role === 'Donor') {
      payload.name = formData.name;
      payload.age = formData.age;
      payload.bloodGroup = formData.bloodGroup;
      payload.location = formData.location;
      payload.contact = formData.contact;
      payload.lastDonationDate = formData.lastDonationDate || null;
    } else if (role === 'Hospital') {
      payload.hospitalName = formData.hospitalName;
      payload.location = formData.location;
      payload.contact = formData.contact;
    }

    const result = signup(payload);
    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(`Account created! Redirecting to login...`);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Donify and make a difference</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-6 flex space-x-4">
          {['Donor', 'Hospital'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setFormData({});
                setError(null);
              }}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                role === r
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r === 'Donor' ? '🩸 Donor' : '🏥 Hospital'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'Donor' ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="bloodGroup"
                  placeholder="Blood Group (A+, O-, etc.)"
                  value={formData.bloodGroup || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="City/Location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="contact"
                  placeholder="Phone/Email"
                  value={formData.contact || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
                <input
                  type="date"
                  name="lastDonationDate"
                  placeholder="Last Donation Date"
                  value={formData.lastDonationDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                name="hospitalName"
                placeholder="Hospital Name"
                value={formData.hospitalName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="City/Location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <Link to="/login" className="text-red-600 font-bold hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
