import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const bloodGroups = [
  { type: 'O-', canDonateTo: 'All Blood Types', canReceiveFrom: 'O-' },
  { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-' },
  { type: 'A+', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-' },
  { type: 'A-', canDonateTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-' },
  { type: 'B+', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-' },
  { type: 'B-', canDonateTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-' },
  { type: 'AB+', canDonateTo: 'AB+', canReceiveFrom: 'All Blood Types' },
  { type: 'AB-', canDonateTo: 'AB+, AB-', canReceiveFrom: 'A-, B-, AB-, O-' },
];

export default function HomePage() {
  const { currentUser, donors, requests, hospitals } = useAuth();
  const activeRequests = requests.filter((r) => r.status === 'Sent' || r.status === 'Accepted');

  // Logged-in dashboard summary
  if (currentUser) {
    return (
      <div className="space-y-8 py-6">
        <section className="page-hero">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_0.95fr] lg:items-end">
            <div className="space-y-5">
              <span className="blood-pill bg-white/12 text-white">Command Center</span>
              <h1 className="font-display text-4xl font-extrabold md:text-6xl">
                Welcome back, {currentUser.name || currentUser.hospitalName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                Your donor network is active, requests are tracked live, and every response flows through one blood-response dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={`/${currentUser.role.toLowerCase()}`} className="action-primary">Open Dashboard</Link>
                <Link to="/requests" className="action-secondary">Review Active Alerts</Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="metric-card">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Active Requests</div>
                <div className="mt-3 text-4xl font-black">{activeRequests.length}</div>
              </div>
              <div className="metric-card">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Available Donors</div>
                <div className="mt-3 text-4xl font-black">{donors.filter((d) => d.available).length}</div>
              </div>
              <div className="metric-card">
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">Partner Hospitals</div>
                <div className="mt-3 text-4xl font-black">{hospitals.length}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Public landing page
  return (
    <div className="py-6">

      {/* ── HERO ── */}
      <section className="page-hero mb-10">
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="blood-pill bg-white/12 text-white">Emergency Blood Network</span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Every drop counts.<br />Be a lifesaver today.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/78 md:text-base">
              Donify connects blood donors with hospitals in real time. Whether you want to donate or need blood urgently — we make it fast, transparent, and life-saving.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="action-primary text-base px-7 py-3">Donor / Hospital Login & Sign Up</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Requests', value: activeRequests.length, color: 'from-red-600 to-rose-700' },
              { label: 'Available Donors', value: donors.filter((d) => d.available).length, color: 'from-orange-500 to-red-600' },
              { label: 'Partner Hospitals', value: hospitals.length, color: 'from-red-700 to-pink-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-[24px] bg-gradient-to-br ${color} p-5 text-white shadow-lg`}>
                <div className="text-3xl font-black">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DONATE ── */}
      <section className="mb-12 overflow-hidden rounded-[32px] bg-white shadow-xl border border-red-100">
        <div className="grid lg:grid-cols-2">
          <div className="flex items-center justify-center bg-red-50 p-8">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-6xl shadow-xl">
                🩸
              </div>
              <div className="text-xl font-black text-red-700">Every 2 Seconds</div>
              <div className="text-slate-600 text-sm">Someone in India needs blood</div>
            </div>
          </div>
          <div className="p-8 md:p-10 space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-red-600 font-bold">Why Donate Blood?</div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Why should you donate blood?</h2>
            <p className="text-slate-600 leading-7">
              Our nation requires <strong>4 Crore Units</strong> of blood while only 40 lakh units are available. Every two seconds someone needs blood — there is no substitute for Human Blood. It cannot be manufactured.
            </p>
            <p className="text-slate-600 leading-7">
              Blood donation is an extremely noble deed, yet there is a scarcity of regular donors across India. We focus on creating &amp; expanding a virtual army of blood donating volunteers who could be searched and contacted by family / care givers of a patient in times of need.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {['Save up to 3 lives per donation', 'Boosts your health too', 'Free blood checkup included'].map((f) => (
                <div key={f} className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-700">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOOD GROUPS ── */}
      <section className="mb-12">
        <div className="mb-6 text-center">
          <div className="inline-block border-b-4 border-red-600 pb-2">
            <div className="text-xs uppercase tracking-[0.3em] text-red-600 font-bold">All Blood Group List</div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-red-700 to-orange-500 text-white">
                <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Blood Group</th>
                <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Can Donate To</th>
                <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {bloodGroups.map((bg, i) => (
                <tr key={bg.type} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                  <td className="px-5 py-3 font-bold text-red-700">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-black shadow">
                      {bg.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{bg.canDonateTo}</td>
                  <td className="px-5 py-3 text-slate-700">{bg.canReceiveFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section className="mb-12 rounded-[32px] bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 p-8 md:p-12 text-white">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <div className="text-xs uppercase tracking-[0.28em] text-orange-400 font-bold">About Us</div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Connecting Hearts,<br />Saving Lives
            </h2>
            <p className="text-white/75 leading-7">
              Donify is a modern blood response network built to eliminate the gap between blood donors and hospitals. We believe no patient should suffer due to lack of blood availability. Our platform makes blood donation simple, fast, and rewarding.
            </p>
            <p className="text-white/75 leading-7">
              Founded with a mission to save lives, Donify brings together verified donors, partner hospitals, and a transparent audit trail — all in one place. Every donation is tracked, every request is visible, and every life saved is celebrated.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { num: '500+', label: 'Registered Donors' },
                { num: '50+', label: 'Partner Hospitals' },
                { num: '1000+', label: 'Lives Saved' },
              ].map(({ num, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center">
                  <div className="text-2xl font-black text-orange-400">{num}</div>
                  <div className="mt-1 text-xs text-white/60 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏥', title: 'Hospital Network', desc: 'Verified hospitals can post urgent blood requests and receive matched donor responses instantly.' },
              { icon: '🩸', title: 'Donor Registry', desc: 'Donors register with their blood type, location and availability for on-demand matching.' },
              { icon: '🔒', title: 'Secure & Verified', desc: 'Every user is verified. Donation records are tamper-proof and transparently audited.' },
              { icon: '⚡', title: 'Real-Time Alerts', desc: 'Instant notifications to matching donors the moment an urgent blood request is created.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-[20px] border border-white/10 bg-white/6 p-5 space-y-2 hover:bg-white/10 transition">
                <div className="text-3xl">{icon}</div>
                <div className="font-bold text-white">{title}</div>
                <div className="text-xs text-white/60 leading-5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mb-12">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-red-600 font-bold">How It Works</div>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Three simple steps to save a life</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: '01', icon: '📝', title: 'Register', text: 'Sign up as a donor or hospital. Set your blood group, location, and availability status.' },
            { step: '02', icon: '🔗', title: 'Connect', text: 'Hospitals post urgent requests. Matching donors get instant alerts and can accept or decline.' },
            { step: '03', icon: '❤️', title: 'Save Lives', text: 'Complete the donation, earn reward points, and build an auditable donation history.' },
          ].map(({ step, icon, title, text }) => (
            <div key={step} className="relative rounded-[28px] bg-white border border-slate-100 shadow-lg p-7 text-center hover:shadow-xl transition">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-xs font-black text-white shadow">
                {step}
              </div>
              <div className="mt-4 text-5xl">{icon}</div>
              <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR DONORS & HOSPITALS ── */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white border border-red-100 shadow-lg p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">🩸</div>
            <div className="text-xs uppercase tracking-[0.22em] text-red-600 font-bold">For Donors</div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">See urgent need and respond with confidence</h3>
          <p className="text-slate-600 leading-7 text-sm">
            View emergency requests, manage your availability, track donation history, earn reward badges, and choose how you want to be contacted.
          </p>
          <ul className="space-y-2">
            {['Urgent request feed with blood type matching', 'Reward points and badge tracking system', 'Full control over notification preferences', 'Donation history and audit trail'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-white border border-orange-100 shadow-lg p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl">🏥</div>
            <div className="text-xs uppercase tracking-[0.22em] text-orange-600 font-bold">For Hospitals</div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Launch requests and match donors faster</h3>
          <p className="text-slate-600 leading-7 text-sm">
            Create urgent blood requests, review strongest donor matches based on compatibility scoring, and monitor request completion in real time.
          </p>
          <ul className="space-y-2">
            {['Rapid blood request creation', 'Compatibility scoring for best matches', 'Real-time donor notification system', 'Complete request monitoring dashboard'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="rounded-[32px] bg-gradient-to-r from-red-700 via-red-600 to-orange-500 p-10 text-center text-white shadow-2xl">
        <div className="text-4xl mb-4">❤️</div>
        <h2 className="text-3xl font-black md:text-4xl">Ready to save a life?</h2>
        <p className="mt-3 text-white/80 max-w-xl mx-auto text-sm leading-7">
          Join thousands of donors and hospitals on Donify. Register today and become part of India's fastest growing voluntary blood donation network.
        </p>
        <div className="mt-6">
          <Link to="/login" className="rounded-full bg-white px-8 py-3 text-sm font-black uppercase tracking-widest text-red-700 shadow-lg hover:bg-orange-50 transition">
            Donor / Hospital Login & Sign Up
          </Link>
        </div>
      </section>

    </div>
  );
}

