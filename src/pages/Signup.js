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

  const handleSubmit = async (e) => {
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

    const result = await signup(payload);
    if (result.error) {
      setError(result.error);
      return;
    }

    const rolePath = (result.user?.role || payload.role || role).toString().toLowerCase();
    setSuccess('Account created! Redirecting to your dashboard...');
    setTimeout(() => {
      navigate(`/${rolePath}`);
    }, 1500);
  };

  return (
    <div className="grid min-h-[calc(100vh-13rem)] gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
      <section className="page-hero">
        <div className="relative z-10 space-y-6">
          <span className="blood-pill bg-white/12 text-white">Join The Network</span>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Create a donor or hospital profile built for emergency response.</h1>
          <p className="max-w-xl text-sm leading-7 text-white/78 md:text-base">
            Register once, keep your blood group and contact channels accurate, and move from signup to response-ready in minutes.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Donor Flow</div>
              <div className="mt-2 text-lg font-bold">Availability, badges, alerts</div>
            </div>
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/65">Hospital Flow</div>
              <div className="mt-2 text-lg font-bold">Request creation, donor matching</div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-6 shadow-2xl shadow-red-950/10 md:p-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm text-slate-600">Join Donify and start coordinating life-saving responses.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
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
              className={`flex-1 rounded-2xl py-3 font-bold transition-all ${
                role === r
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-red-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                  className="input-shell"
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="input-shell"
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
                  className="input-shell"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="City/Location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="input-shell"
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
                  className="input-shell"
                  required
                />
                <input
                  type="date"
                  name="lastDonationDate"
                  placeholder="Last Donation Date"
                  value={formData.lastDonationDate || ''}
                  onChange={handleChange}
                  className="input-shell"
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
                className="input-shell"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="City/Location"
                value={formData.location || ''}
                onChange={handleChange}
                className="input-shell"
                required
              />
              <input
                type="tel"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact || ''}
                onChange={handleChange}
                className="input-shell"
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
            className="input-shell"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password || ''}
            onChange={handleChange}
            className="input-shell"
            required
          />

          <button
            type="submit"
            className="action-primary w-full"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">Already have an account?</p>
          <Link to="/login" className="font-bold text-red-700 hover:underline">
            Login Here
          </Link>
        </div>
      </section>
    </div>
  );
}
