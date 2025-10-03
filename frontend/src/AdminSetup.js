import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api'; 

function AdminSetup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('Registering Admin...');

        // Note: This endpoint should only be used once to create the first admin!
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/admin`, {
                email,
                password,
            });

            setMessage(`SUCCESS: ${response.data}. Redirecting to login...`);
            
            // Navigate to the login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed. Check if server is running.';
            setMessage(`ERROR: ${errorMessage}`);
            console.error('Registration error:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1>Initial Admin Registration</h1>
            <p>This is a one-time step to create the primary administrator account.</p>

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Admin Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Admin Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Register Admin
                </button>

                {message && <p style={{ marginTop: '15px', color: message.startsWith('ERROR') ? 'red' : 'green' }}>{message}</p>}
                
            </form>
        </div>
    );
}

export default AdminSetup;