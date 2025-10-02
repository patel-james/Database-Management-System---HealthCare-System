import React from 'react';
import { Link } from 'react-router-dom';

function PatientDashboard() {
  return (
    <div>
      <h1>Patient Dashboard</h1>
      <p>Welcome. View your appointments and health history.</p>
      <Link to="/" onClick={() => localStorage.clear()}>Logout</Link>
    </div>
  );
}

export default PatientDashboard;