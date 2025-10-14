import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

function Login() {
    const { role } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, role: loggedInRole, profile_id } = response.data;

            // Important: Check if the role from the token matches the login page role
            if (loggedInRole.toLowerCase() !== role.toLowerCase()) {
                setMessage(`Login successful, but you are a ${loggedInRole}. Please use the correct portal.`);
                setIsLoading(false);
                return;
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', loggedInRole);
            localStorage.setItem('profileId', profile_id);

            // Redirect to the correct dashboard
            navigate(`/${loggedInRole.toLowerCase()}/dashboard`);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

    return (
        <div className="auth-page-container">
            <style>{STYLES}</style>
            <div className="auth-left-panel">
                <div className="brand-logo">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22V12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
                <h1>Welcome Back</h1>
                <p>Sign in to access your personalized healthcare dashboard.</p>
            </div>
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <Link to="/" className="back-link">&larr; Back to Role Selection</Link>
                    <h2>{roleTitle} Sign In</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
                    
                    {/* Conditional links based on the role */}
                    {role !== 'admin' ? (
                        <p className="auth-switch-text">
                            Don't have an account? <Link to={`/signup/${role}`}>Sign Up</Link>
                        </p>
                    ) : (
                        <p className="auth-switch-text">
                           Need to set up a new administrator? <Link to="/setup">Create Admin Account</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Shared styles for a consistent look between login and signup pages
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { margin: 0; font-family: 'Inter', sans-serif; }
    .auth-page-container { display: flex; min-height: 100vh; }
    .auth-left-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(to top right, #007bff, #0056b3); color: white; padding: 50px; text-align: left; }
    .auth-left-panel h1 { font-size: 3rem; margin: 20px 0 10px; }
    .auth-left-panel p { font-size: 1.2rem; max-width: 400px; line-height: 1.6; }
    .auth-right-panel { flex: 1; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; padding: 40px; }
    .auth-form-container { width: 100%; max-width: 450px; }
    .auth-form-container h2 { font-size: 2.2rem; color: #333; margin-bottom: 30px; }
    .auth-form-container input { width: 100%; padding: 14px; margin-bottom: 18px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.3s; }
    .auth-form-container input:focus { border-color: #007bff; outline: none; }
    .auth-button { width: 100%; padding: 14px; background-color: #007bff; color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background-color 0.3s; margin-top: 10px; }
    .auth-button:hover { background-color: #0056b3; }
    .auth-button:disabled { background-color: #a0a0a0; cursor: not-allowed; }
    .message { text-align: center; margin-top: 20px; font-weight: 500; padding: 10px; border-radius: 5px; }
    .message.error { color: #d9534f; background-color: #f2dede; }
    .message.success { color: #5cb85c; background-color: #dff0d8;}
    .back-link { display: inline-block; margin-bottom: 25px; color: #007bff; text-decoration: none; font-weight: 600; }
    .auth-switch-text { text-align: center; margin-top: 25px; color: #555; }
    .auth-switch-text a { color: #007bff; font-weight: 600; text-decoration: none; }
`;

export default Login;

