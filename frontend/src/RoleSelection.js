import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- SVG Icon Components ---
const PatientIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 10c-3.87 0-7 1.79-7 4v3h14v-3c0-2.21-3.13-4-7-4z" />
  </svg>
);

const DoctorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M12 11v6" />
    <path d="M9.5 14h5" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const BrandLogo = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


function RoleSelection() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const pageStyle = {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        position: 'relative' // Added for positioning context
    };

    const leftPanelStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to top right, #007bff, #0056b3)',
        color: 'white',
        padding: '40px',
        textAlign: 'center',
        transition: 'transform 0.8s ease-in-out',
        transform: loaded ? 'translateX(0)' : 'translateX(-100%)',
    };

    const rightPanelStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
    };

    const roleContainerStyle = {
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-in-out 0.4s, transform 0.8s ease-in-out 0.4s',
    };
    
    return (
        <>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { margin: 0; }
                .role-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    padding: 18px 30px;
                    margin: 12px 0;
                    width: 300px;
                    cursor: pointer;
                    border-radius: 12px;
                    border: 1px solid #e0e0e0;
                    background-color: #ffffff;
                    color: #333;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    transition: all 0.25s ease-in-out;
                    text-align: center;
                }
                .role-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    border-color: #007bff;
                    color: #007bff;
                }
                .role-button svg {
                    transition: stroke 0.25s ease-in-out;
                }
                .role-button:hover svg {
                    stroke: #007bff;
                }
                .credentials-link {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #007bff;
                    border-radius: 50px;
                    color: #007bff;
                    background-color: white;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    z-index: 10;
                }
                .credentials-link:hover {
                    background-color: #007bff;
                    color: white;
                }
                `}
            </style>
            <div style={pageStyle}>
                <Link to="/credits" className="credentials-link">Credentials</Link>
                
                <div style={leftPanelStyle}>
                    <div style={{ marginBottom: '20px' }}><BrandLogo /></div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 700, margin: '0 0 10px 0' }}>Total Health</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '350px', lineHeight: '1.6' }}>
                        Your centralized hub for seamless healthcare management.
                    </p>
                </div>

                <div style={rightPanelStyle}>
                    <div style={roleContainerStyle}>
                        <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>Select Your Role</h2>
                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px' }}>Choose your portal to sign in.</p>
                        
                        <button className="role-button" onClick={() => navigate('/login/patient')}>
                            <PatientIcon />
                            <span>I am a Patient</span>
                        </button>
                        
                        <button className="role-button" onClick={() => navigate('/login/doctor')}>
                            <DoctorIcon />
                            <span>I am a Doctor</span>
                        </button>
                        
                        <button className="role-button" onClick={() => navigate('/login/admin')}>
                            <AdminIcon />
                            <span>I am an Administrator</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RoleSelection;

