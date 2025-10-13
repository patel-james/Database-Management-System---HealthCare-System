import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

function Signup() {
    const { role } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // Common fields
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        // Patient specific fields
        date_of_birth: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        // Doctor specific field
        specialization: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const payload = {
            ...formData,
            role: role.charAt(0).toUpperCase() + role.slice(1)
        };

        try {
            await axios.post(`${API_BASE_URL}/auth/register`, payload);
            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate(`/login/${role}`);
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
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
                <h1>Join Total Health</h1>
                <p>Create your account to manage your health journey with us.</p>
            </div>
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <Link to="/" className="back-link">&larr; Back to Role Selection</Link>
                    <h2>Create {roleTitle} Account</h2>
                    <form onSubmit={handleSubmit}>
                        {/* --- Common Fields --- */}
                        <div className="form-group-row">
                            <input name="first_name" type="text" placeholder="First Name" onChange={handleChange} required />
                            <input name="last_name" type="text" placeholder="Last Name" onChange={handleChange} required />
                        </div>
                        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Password" minLength="6" onChange={handleChange} required />
                        <input name="phone_number" type="tel" placeholder="Phone Number (e.g., 555-123-4567)" onChange={handleChange} required />

                        {/* --- Patient Specific Fields --- */}
                        {role === 'patient' && (
                            <>
                                <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleChange} required />
                                <input name="address" type="text" placeholder="Full Address" onChange={handleChange} required />
                                <div className="form-group-row">
                                    <input name="emergency_contact_name" type="text" placeholder="Emergency Contact Name" onChange={handleChange} required />
                                    <input name="emergency_contact_phone" type="tel" placeholder="Emergency Contact Phone" onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        {/* --- Doctor Specific Fields --- */}
                        {role === 'doctor' && (
                             <input name="specialization" type="text" placeholder="Specialization (e.g., Cardiology)" onChange={handleChange} required />
                        )}

                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
                    <p className="auth-switch-text">
                        Already have an account? <Link to={`/login/${role}`}>Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

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
    .form-group-row { display: flex; gap: 15px; }
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

export default Signup;

