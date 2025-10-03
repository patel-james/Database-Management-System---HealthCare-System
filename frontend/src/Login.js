import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

const API_BASE_URL = 'http://localhost:3001/api'; 

function Login() { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); 
        
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, role, profile_id } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('profileId', profile_id); 
            
            setMessage(`Login successful! Redirecting...`);
            
            const lowerCaseRole = role.toLowerCase();
            navigate(`/${lowerCaseRole}/dashboard`);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Check server status and credentials.';
            setMessage(errorMessage);
            console.error('Login error:', error);
        }
    };

    return (
        <div className="full-page-center">
            <style>
                {`
                .full-page-center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f4f7f6; /* Very light grey/off-white background */
                    font-family: Arial, sans-serif;
                }
                .login-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 40px;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border-top: 5px solid #007bff; /* Accent color: Blue */
                }
                .login-container h2 {
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                    font-size: 1.8rem;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #555;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-sizing: border-box;
                    transition: border-color 0.3s;
                }
                .form-group input:focus {
                    border-color: #007bff;
                    outline: none;
                }
                .login-button {
                    width: 100%;
                    padding: 12px;
                    background-color: #007bff; /* Primary Action Color */
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s, transform 0.1s;
                    margin-top: 10px;
                }
                .login-button:hover {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                }
                .message {
                    text-align: center;
                    margin-top: 20px;
                    font-weight: 500;
                    color: red;
                }
                `}
            </style>
            
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

                    {message && <p className="message">{message}</p>}
                    
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/setup" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Need to setup Admin Account?
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;