import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login'; 
import Signup from './Signup';
import RoleSelection from './RoleSelection';
import AdminSetup from './AdminSetup'; 
import Credits from './Credits'; // Import the new Credits component
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

// --- Helper Component to Protect Routes ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole'); 

  if (!isAuthenticated) {
    // Redirect to the role selection page if not authenticated
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    localStorage.clear(); 
    // It's better to handle this via state management than a disruptive alert
    console.error(`Access Denied! Your role (${userRole}) cannot view this page.`);
    return <Navigate to="/" replace />;
  }

  return children;
};

// --- Main Application Component ---
function App() {
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/signup/:role" element={<Signup />} />
          <Route path="/setup" element={<AdminSetup />} /> 
          <Route path="/credits" element={<Credits />} /> {/* Add the new route for the credits page */}

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
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Route Logic */}
          <Route 
            path="*" 
            element={
              isAuthenticated && userRole ? 
                <Navigate to={`/${userRole.toLowerCase()}/dashboard`} /> : 
                <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

