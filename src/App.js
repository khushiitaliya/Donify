import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Requests from './pages/Requests';
import Donors from './pages/Donors';
import Blockchain from './pages/Blockchain';

import DonorDashboard from './pages/donor/DonorDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !requiredRoles.map((role) => role.toLowerCase()).includes(currentUser.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 md:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={currentUser ? <Navigate to={`/${currentUser.role.toLowerCase()}`} replace /> : <Login />} />
          <Route path="/signup" element={currentUser ? <Navigate to={`/${currentUser.role.toLowerCase()}`} replace /> : <Signup />} />
          <Route
            path="/requests"
            element={currentUser ? <Requests /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/donors"
            element={
              <ProtectedRoute requiredRoles={['hospital', 'admin']}>
                <Donors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blockchain"
            element={currentUser ? <Blockchain /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/donor"
            element={
              <ProtectedRoute requiredRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital"
            element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
