import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DonorDashboard from './components/donor/DonorDashboard';
import BloodRequests from './components/donor/BloodRequests';
import HospitalDashboard from './components/hospital/HospitalDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// Import styles
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Donor Routes */}
            <Route path="/donor/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/donor/requests" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['donor']}>
                  <BloodRequests />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            {/* Hospital Routes */}
            <Route path="/hospital/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['hospital']}>
                  <HospitalDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/auth/login" />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/auth/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
