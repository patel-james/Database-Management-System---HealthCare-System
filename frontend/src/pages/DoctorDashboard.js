import React from 'react';
import { Link } from 'react-router-dom';

function DoctorDashboard() {
  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <p>Welcome, Doctor. View and manage your appointments, diagnoses, and prescriptions.</p>
      <Link to="/" onClick={() => localStorage.clear()}>Logout</Link>
    </div>
  );
}

export default DoctorDashboard;