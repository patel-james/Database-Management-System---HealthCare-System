// src/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Needed for redirection

// --- Configuration ---
// Set the base URL for your Node.js backend
const API_BASE_URL = 'http://localhost:3001/api'; 
// Assuming you did not create a separate CSS file:
// import './Login.css'; 

function Login() {
    // Hooks for managing component state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook for programmatic navigation

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        
        try {
            // Send credentials to the backend login endpoint
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            // Login successful! Destructure results from the backend
            const { token, role, profile_id } = response.data;
            
            // 1. Store the JWT token and user info (essential for future authenticated requests)
            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('profileId', profile_id); // The specific doctor_id or patient_id
            
            setMessage(`Login successful! Redirecting...`);
            
            // 2. Redirect based on the user's role (RBAC implemented in App.js)
            const lowerCaseRole = role.toLowerCase();
            navigate(`/${lowerCaseRole}/dashboard`);

        } catch (error) {
            // Handle errors from the API (e.g., 401 Invalid Credentials)
            // Use optional chaining (?) for safe access to the error response
            const errorMessage = error.response?.data?.message || 'Login failed. Check server status and credentials.';
            setMessage(errorMessage);
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <h2>Healthcare Management System Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
                
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit" className="login-button">Log In</button>

                {/* Display messages */}
                {message && <p className="message">{message}</p>}
                
            </form>
        </div>
    );
}

export default Login;