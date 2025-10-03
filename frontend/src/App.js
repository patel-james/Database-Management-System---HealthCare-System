import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login'; 
import AdminSetup from './AdminSetup'; 
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

// --- Helper Component to Protect Routes ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  // FIX: Declared and assigned userRole in one line to clear the 'no-unused-vars' warning
  const userRole = localStorage.getItem('userRole'); 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    localStorage.clear(); 
    alert(`Access Denied! Your role (${userRole}) cannot view this page.`);
    return <Navigate to="/login" replace />;
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
          {/* NEW Public Route: Admin Registration */}
          <Route path="/setup" element={<AdminSetup />} /> 

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

          {/* Default Route: TEMPORARILY change the redirect logic for setup */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? 
                `/${localStorage.getItem('userRole').toLowerCase()}/dashboard` : 
                "/setup"} 
                /* ^--- TEMPORARILY redirect to /setup if not logged in */
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
