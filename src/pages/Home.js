import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 mb-8 border-2 border-red-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-lg text-gray-600">
            You're logged in as <strong>{currentUser.name || currentUser.hospitalName}</strong>
          </p>
          <Link
            to={`/${currentUser.role.toLowerCase()}`}
            className="mt-4 inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-8 border-2 border-red-200">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Donify</h1>
          <p className="text-xl text-gray-700 mb-6">
            Save lives by donating blood. Connect with hospitals in need and make a real impact in your community.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🩸</span>
              <span className="text-gray-700">Find urgent blood requests</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700">Earn rewards and badges</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏥</span>
              <span className="text-gray-700">Help hospitals in emergencies</span>
            </div>
          </div>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Register as Donor
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">For Hospitals</h2>
          <p className="text-lg text-gray-700 mb-6">
            Create emergency requests and instantly connect with available donors in your area. Build a reliable blood network.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚑</span>
              <span className="text-gray-700">Create emergency requests</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <span className="text-gray-700">Track request status in real-time</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span className="text-gray-700">Smart donor matching</span>
            </div>
          </div>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Register Hospital
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-5xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up</h3>
            <p className="text-gray-600">Create your account as a donor or hospital</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">View requests or find available donors</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Save Lives</h3>
            <p className="text-gray-600">Complete donations and earn rewards</p>
          </div>
        </div>
      </div>
    </div>
  );
}
