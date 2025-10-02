import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login'; // Assuming you put Login.js in src/components
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

// --- Helper Component to Protect Routes ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    // 1. If not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // 2. If logged in but lacks the correct role, redirect to a forbidden page or login
    // In a simple app, we'll redirect to a generic page or login.
    localStorage.clear(); // Clear bad credentials
    alert(`Access Denied! Your role (${userRole}) cannot view this page.`);
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated and authorized, render the child component (the desired page)
  return children;
};

// --- Main Application Component ---
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Route: The Login page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Dashboards) */}
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

          {/* Default Route: Check if user is logged in, then redirect to their dashboard, otherwise redirect to login */}
          <Route 
            path="*" 
            element={
              <Navigate to={localStorage.getItem('authToken') ? 
                `/${localStorage.getItem('userRole').toLowerCase()}/dashboard` : 
                "/login"} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;