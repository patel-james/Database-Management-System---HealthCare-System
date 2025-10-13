import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Import Page Components ---
import RoleSelection from './RoleSelection'; // The new landing page
import Login from './login';
import Signup from './Signup'; // The new signup page
import AdminSetup from './AdminSetup';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

// --- Helper Component to Protect Routes ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  // If not logged in, redirect to the main role selection page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If the user's role is not allowed for this route, log them out and redirect
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    localStorage.clear();
    // Using console.error is better than alert for a smoother user experience
    console.error(`Access Denied! Your role (${userRole}) cannot view this page.`);
    return <Navigate to="/" replace />;
  }

  return children;
};

// --- Main Application Component ---
function App() {
  const isAuthenticated = localStorage.getItem('authToken');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/signup/:role" element={<Signup />} />
          <Route path="/setup" element={<AdminSetup />} />

          {/* --- Protected Dashboard Routes --- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Patient', 'Admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* --- Default Catch-All Route --- */}
          <Route
            path="*"
            element={
              <Navigate to={
                isAuthenticated
                  ? `/${localStorage.getItem('userRole').toLowerCase()}/dashboard`
                  : "/" // If not logged in, redirect to the main role selection page
              }
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

