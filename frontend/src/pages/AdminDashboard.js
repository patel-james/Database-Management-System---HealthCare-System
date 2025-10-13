import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

// --- SVG Icon Components ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const StethoscopeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5.4 2l-1-1.7a.4.4 0 0 0-.7 0l-1 1.7a.3.3 0 1 0 .6.4L3 1.2l1.8 1.1Z"/><path d="M18 3.5c0-1.7-1.3-3-3-3-1.6 0-3 1.3-3 3v11c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-11Z"/><path d="M11 5.5a2.5 2.5 0 1 0-5 0v1.4c0 1.2 1 2.1 2.2 2.1h.6c1.2 0 2.2-.9 2.2-2.1V5.5Z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

// --- Reusable Form for Adding/Editing Users ---
const UserForm = ({ user, role, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        password: '', // Always empty for security
        phone_number: user?.phone_number || '',
        ...(role === 'patient' ? {
            date_of_birth: user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
            address: user?.address || '',
            emergency_contact_name: user?.emergency_contact_name || '',
            emergency_contact_phone: user?.emergency_contact_phone || '',
        } : {
            specialization: user?.specialization || '',
        }),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isPatient = role === 'patient';
    const title = `${user ? 'Edit' : 'Create'} ${isPatient ? 'Patient' : 'Doctor'} Profile`;

    return (
        <form onSubmit={handleSubmit} className="user-form">
            <h2 className="form-title">{title}</h2>
            <div className="form-grid">
                <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" required />
                <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={user ? 'New Password (Optional)' : 'Password'} required={!user} />
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
                {isPatient ? (
                    <>
                        <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} placeholder="Date of Birth" />
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                        <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="Emergency Contact Name" />
                        <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} placeholder="Emergency Contact Phone" />
                    </>
                ) : (
                    <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" />
                )}
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="form-cancel-btn">Cancel</button>
                <button type="submit" className="form-save-btn">Save Changes</button>
            </div>
        </form>
    );
};


// --- Main Admin Dashboard Component ---
function AdminDashboard() {
    const [view, setView] = useState('patients'); // 'patients' or 'doctors'
    const [data, setData] = useState({ patients: [], doctors: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('authToken');

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login/admin');
    }, [navigate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { handleLogout(); return; }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [patientsRes, doctorsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/patients`, config),
                axios.get(`${API_BASE_URL}/doctors`, config)
            ]);
            setData({ patients: patientsRes.data, doctors: doctorsRes.data });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to fetch data.';
            setError(`Error: ${errorMessage}`);
            if ([401, 403].includes(err.response?.status)) setTimeout(handleLogout, 3000);
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        const token = getToken();
        try {
            await axios.delete(`${API_BASE_URL}/${view}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || 'Failed to delete user.'}`);
        }
    };
    
    const handleSave = async (formData) => {
        const token = getToken();
        const url = editingUser
            ? `${API_BASE_URL}/${view}/${editingUser.patient_id || editingUser.doctor_id}`
            : `${API_BASE_URL}/${view}`;
        const method = editingUser ? 'put' : 'post';
        
        if (editingUser && !formData.password) delete formData.password;

        try {
            await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || 'Operation failed.'}`);
        }
    };

    const renderTable = () => {
        const tableData = view === 'patients' ? data.patients : data.doctors;
        const columns = view === 'patients' 
            ? ['Patient ID', 'Full Name', 'Email', 'Phone', 'DOB']
            : ['Doctor ID', 'Full Name', 'Email', 'Phone', 'Specialization'];
        
        return (
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map(col => <th key={col}>{col}</th>)}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.length > 0 ? tableData.map(item => (
                        <tr key={item.patient_id || item.doctor_id}>
                            <td>#{item.patient_id || item.doctor_id}</td>
                            <td>{item.first_name} {item.last_name}</td>
                            <td>{item.email}</td>
                            <td>{item.phone_number}</td>
                            <td>{view === 'patients' ? new Date(item.date_of_birth).toLocaleDateString() : item.specialization}</td>
                            <td className="action-cell">
                                <button onClick={() => handleEdit(item)} className="action-btn edit-btn"><EditIcon /></button>
                                <button onClick={() => handleDelete(item.patient_id || item.doctor_id)} className="action-btn delete-btn"><DeleteIcon /></button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length + 1}>No {view} found.</td></tr>
                    )}
                </tbody>
            </table>
        );
    };

    if (loading) return <div className="loading-state">Loading Dashboard...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="admin-dashboard">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                
                :root {
                    --primary-color: #4F46E5;
                    --primary-hover: #4338CA;
                    --secondary-color: #10B981;
                    --secondary-hover: #059669;
                    --danger-color: #EF4444;
                    --danger-hover: #DC2626;
                    --bg-color: #F3F4F6;
                    --card-bg: #FFFFFF;
                    --text-primary: #1F2937;
                    --text-secondary: #6B7280;
                    --border-color: #E5E7EB;
                }

                .admin-dashboard { 
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg-color);
                    font-family: 'Poppins', sans-serif;
                }

                .sidebar {
                    width: 260px;
                    background-color: var(--card-bg);
                    padding: 2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--border-color);
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 3rem;
                }
                .sidebar-logo {
                    background-color: var(--primary-color);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 0.5rem;
                    display: grid;
                    place-items: center;
                }
                .sidebar-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }

                .nav-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .nav-item:hover { background-color: var(--bg-color); color: var(--text-primary); }
                .nav-item.active { background-color: var(--primary-color); color: white; }

                .sidebar-footer {
                    margin-top: auto;
                }
                .logout-button {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.2s ease-in-out;
                }
                .logout-button:hover { background-color: #FEE2E2; color: var(--danger-color); }
                
                .main-content {
                    flex: 1;
                    padding: 2.5rem;
                    overflow-y: auto;
                }

                .main-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .main-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); }
                .add-new-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out;
                }
                .add-new-button:hover { background-color: var(--primary-hover); }

                .stats-bar {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background-color: var(--card-bg);
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid var(--border-color);
                }
                .stat-card-title { color: var(--text-secondary); font-weight: 500; margin-bottom: 0.5rem; }
                .stat-card-value { font-size: 2.25rem; font-weight: 700; color: var(--text-primary); }
                
                .table-container {
                    background-color: var(--card-bg);
                    border-radius: 0.75rem;
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { padding: 1rem 1.5rem; text-align: left; }
                .data-table th { background-color: #F9FAFB; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
                .data-table tr:not(:last-child) { border-bottom: 1px solid var(--border-color); }
                .data-table td { color: var(--text-primary); font-weight: 500; }
                .action-cell { text-align: right; }
                .action-btn { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background-color 0.2s; }
                .action-btn:hover { background-color: var(--bg-color); }
                .edit-btn { color: var(--primary-color); }
                .delete-btn { color: var(--danger-color); }

                /* Modal and Form Styles */
                .modal-backdrop { position: fixed; inset: 0; background-color: rgba(31, 41, 55, 0.5); display: grid; place-items: center; z-index: 1000; animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .modal-content { background-color: var(--card-bg); padding: 2.5rem; border-radius: 1rem; width: 90%; max-width: 600px; position: relative; animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; }
                .form-title { font-size: 1.5rem; font-weight: 600; text-align: center; margin-bottom: 2rem; color: var(--text-primary); }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .user-form input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; }
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .form-cancel-btn, .form-save-btn { padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600; }
                .form-cancel-btn { background-color: var(--bg-color); color: var(--text-primary); }
                .form-save-btn { background-color: var(--primary-color); color: white; }
            `}</style>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <UserForm
                        user={editingUser}
                        role={view.slice(0, -1)}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}

            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo"><StethoscopeIcon/></div>
                    <span className="sidebar-title">HealthCare OS</span>
                </div>
                <nav className="nav-menu">
                    <div className={`nav-item ${view === 'patients' ? 'active' : ''}`} onClick={() => setView('patients')}>
                        <UserIcon />
                        <span>Patients</span>
                    </div>
                    <div className={`nav-item ${view === 'doctors' ? 'active' : ''}`} onClick={() => setView('doctors')}>
                        <StethoscopeIcon />
                        <span>Doctors</span>
                    </div>
                </nav>
                <footer className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </footer>
            </aside>
            
            <main className="main-content">
                <header className="main-header">
                    <h1>Welcome, Admin!</h1>
                    <button onClick={handleAddNew} className="add-new-button">
                        <PlusIcon />
                        <span>Add New {view === 'patients' ? 'Patient' : 'Doctor'}</span>
                    </button>
                </header>
                
                <section className="stats-bar">
                    <div className="stat-card">
                        <h3 className="stat-card-title">Total Patients</h3>
                        <p className="stat-card-value">{data.patients.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3 className="stat-card-title">Total Doctors</h3>
                        <p className="stat-card-value">{data.doctors.length}</p>
                    </div>
                </section>
                
                <section className="table-container">
                    {renderTable()}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;

