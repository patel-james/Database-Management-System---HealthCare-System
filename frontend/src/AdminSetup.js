import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';
const ADMIN_PASSCODE = '2377'; // The secret passcode

function AdminSetup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [passcode, setPasscode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handlePasscodeSubmit = (e) => {
        e.preventDefault();
        if (passcode === ADMIN_PASSCODE) {
            setIsVerified(true);
            setMessage('');
        } else {
            setMessage('Incorrect passcode.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Registering Admin...');
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/admin`, {
                email,
                password,
            });
            setMessage(`SUCCESS: ${response.data}. Redirecting to login...`);
            setTimeout(() => {
                navigate('/login/admin');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPasscodeGate = () => (
        <div className="auth-form-container">
            <Link to="/login/admin" className="back-link">&larr; Back to Admin Login</Link>
            <h2>Admin Setup Access</h2>
            <form onSubmit={handlePasscodeSubmit}>
                <input
                    type="password"
                    placeholder="Enter Setup Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                />
                <button type="submit" className="auth-button">Verify</button>
            </form>
            {message && <p className="message error">{message}</p>}
        </div>
    );

    const renderAdminRegistration = () => (
        <div className="auth-form-container">
             <Link to="/login/admin" className="back-link">&larr; Back to Admin Login</Link>
            <h2>Create New Admin Account</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Admin Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Choose a Strong Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Admin'}
                </button>
            </form>
            {message && <p className={`message ${message.startsWith('SUCCESS') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );

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
                <h1>Admin Setup</h1>
                <p>Secure portal for initial administrator account creation.</p>
            </div>
            <div className="auth-right-panel">
                {isVerified ? renderAdminRegistration() : renderPasscodeGate()}
            </div>
        </div>
    );
}

// Using the same styles as your login page for consistency
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

export default AdminSetup;

