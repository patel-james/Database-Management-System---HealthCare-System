import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Administrator. You have full control.</p>
      <Link to="/" onClick={() => localStorage.clear()}>Logout</Link>
    </div>
  );
}

export default AdminDashboard;