import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

// --- SVG Icon Components ---
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const LoadingSpinner = () => <div className="spinner"></div>;

// --- Components ---
const ThemeToggle = ({ theme, onToggle }) => ( <button onClick={onToggle} className="theme-toggle"><SunIcon className={`icon sun ${theme === 'light' ? 'active' : ''}`} /><MoonIcon className={`icon moon ${theme === 'dark' ? 'active' : ''}`} /></button> );
const Modal = ({ children, onClose }) => ( <div className="modal-backdrop"><div className="modal-content"><button onClick={onClose} className="modal-close-btn">&times;</button>{children}</div></div> );

// --- Main Doctor Dashboard Component ---
function DoctorDashboard() {
    const [activeAppointments, setActiveAppointments] = useState([]);
    const [historyAppointments, setHistoryAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [view, setView] = useState('active'); // 'active' or 'history'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('dashboardTheme') || 'dark');

    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [prescriptions, setPrescriptions] = useState([{ medication_name: '', dosage: '', instructions: '' }]);

    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('authToken');

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('dashboardTheme', newTheme);
    };

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/');
    }, [navigate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { handleLogout(); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const [activeRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/appointments/doctor`, config),
                axios.get(`${API_BASE_URL}/appointments/doctor/history`, config)
            ]);
            setActiveAppointments(activeRes.data);
            setHistoryAppointments(historyRes.data);
        } catch (err) {
            setError('Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    const handleOpenModal = (appointment) => {
        setSelectedAppointment(appointment);
        setDiagnosis(''); setNotes(''); setPrescriptions([{ medication_name: '', dosage: '', instructions: '' }]);
    };

    const handleCloseModal = () => setSelectedAppointment(null);

    const handlePrescriptionChange = (index, event) => {
        const values = [...prescriptions];
        values[index][event.target.name] = event.target.value;
        setPrescriptions(values);
    };

    const addPrescriptionField = () => setPrescriptions([...prescriptions, { medication_name: '', dosage: '', instructions: '' }]);
    
    const handleUpdateStatus = async (appointmentId, status) => {
        const token = getToken();
        try {
            await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || `Failed to update status.`}`);
        }
    };

    const handleSaveConsultation = async () => {
        const token = getToken();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (diagnosis) {
                await axios.post(`${API_BASE_URL}/diagnosis`, { appointment_id: selectedAppointment.appointment_id, diagnosis_description: diagnosis, notes: notes }, config);
            }
            const validPrescriptions = prescriptions.filter(p => p.medication_name);
            for (const prescription of validPrescriptions) {
                 await axios.post(`${API_BASE_URL}/prescriptions`, { appointment_id: selectedAppointment.appointment_id, ...prescription }, config);
            }
            await handleUpdateStatus(selectedAppointment.appointment_id, 'Completed');
            alert('Consultation saved successfully!');
            handleCloseModal();
        } catch(err) {
            alert(`Error: ${err.response?.data?.error || 'Failed to save consultation.'}`);
        }
    };

    const renderAppointmentsList = (appointments, isHistory) => {
        if (appointments.length === 0) {
            return (
                <div className="no-appointments">
                    <ClipboardIcon />
                    <h3>{isHistory ? 'No History Found' : 'No Upcoming Appointments'}</h3>
                    <p>{isHistory ? 'You have no archived appointments.' : 'Your schedule is clear.'}</p>
                </div>
            );
        }

        return (
            <div className="appointments-timeline">
                {appointments.map((app, index) => (
                    <div key={app.appointment_id} className="timeline-item" style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-card" onClick={() => app.status !== 'Archived' && handleOpenModal(app)}>
                            <div className={`card-accent-bar status-${app.status?.toLowerCase()}`}></div>
                            <div className="card-content">
                                <h3>{app.patient_first_name} {app.patient_last_name}</h3>
                                <p className="date-time">{new Date(app.appointment_date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                                <p className="reason">{app.reason_for_visit}</p>
                            </div>
                            <div className="card-status">
                                <span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (loading) return <div className="loading-state"><LoadingSpinner /></div>;
        if (error) return <div className="error-state">{error}</div>;
        return (
            <div className="content-card">
                <div className="content-header">
                    <h2>{view === 'active' ? 'Upcoming Appointments' : 'Appointment History'}</h2>
                </div>
                {renderAppointmentsList(view === 'active' ? activeAppointments : historyAppointments, view === 'history')}
            </div>
        );
    };

    return (
        <div className={`doctor-dashboard ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
            <div className="background-animation"></div>
            <style>{`
                /* FONT & THEME */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                .theme-light { --bg-color: #F9FAFB; --sidebar-bg: #FFFFFF; --card-bg: #FFFFFF; --text-primary: #111827; --text-secondary: #6B7280; --border-color: #E5E7EB; --accent-primary: #4F46E5; --accent-secondary: #10B981; --accent-tertiary: #FBBF24; --accent-danger: #EF4444; --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .theme-dark { --bg-color: #0F172A; --sidebar-bg: rgba(30, 41, 59, 0.5); --card-bg: rgba(30, 41, 59, 0.7); --text-primary: #F8FAFC; --text-secondary: #94A3B8; --border-color: rgba(255, 255, 255, 0.1); --accent-primary: #22D3EE; --accent-secondary: #34D399; --accent-tertiary: #FBBF24; --accent-danger: #F472B6; --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
                
                /* BASE LAYOUT */
                .doctor-dashboard { display: flex; min-height: 100vh; background-color: var(--bg-color); font-family: 'Poppins', sans-serif; color: var(--text-primary); }
                .theme-dark .background-animation { position: fixed; inset: 0; z-index: -1; background: linear-gradient(-45deg, #0F172A, #1E293B, #334155, #475569); background-size: 400% 400%; animation: gradientBG 15s ease infinite; }
                @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                
                /* SIDEBAR */
                .sidebar { width: 260px; background: var(--sidebar-bg); backdrop-filter: blur(10px); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; display: flex; flex-direction: column; }
                .sidebar-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 3rem; }
                .sidebar-logo { background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary)); color: white; width: 40px; height: 40px; border-radius: 0.5rem; display: grid; place-items: center; font-weight: 700; font-size: 1.5rem; }
                .sidebar-title { font-size: 1.25rem; font-weight: 600; }
                .nav-menu { display: flex; flex-direction: column; gap: 0.5rem; }
                .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 0.5rem; color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; }
                .nav-item.active { color: white; background-color: var(--accent-primary); }
                .theme-dark .nav-item.active { border-color: var(--accent-primary); background-color: rgba(34, 211, 238, 0.1); color: var(--accent-primary); }
                .sidebar-footer { margin-top: auto; }
                .logout-button { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 0.75rem 1rem; background: none; border: none; color: var(--text-secondary); font-size: 1rem; }
                
                /* MAIN CONTENT */
                .main-content { flex: 1; padding: 2.5rem; }
                .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .main-header h1 { font-size: 2.25rem; font-weight: 700; }
                .content-card { background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid var(--border-color); border-radius: 1rem; box-shadow: var(--shadow); padding: 2.5rem; animation: slideInUp 0.5s ease-out; }
                .content-header h2 { font-size: 1.75rem; font-weight: 600; }
                
                /* APPOINTMENTS */
                .appointments-timeline { position: relative; padding-left: 2rem; }
                .appointments-timeline::before { content: ''; position: absolute; top: 0; left: 11px; height: 100%; width: 2px; background-color: var(--border-color); }
                .timeline-item { position: relative; margin-bottom: 1.5rem; animation: popIn 0.5s ease-out backwards; }
                .timeline-dot { position: absolute; top: 5px; left: -2rem; height: 1rem; width: 1rem; background-color: var(--accent-secondary); border-radius: 50%; border: 3px solid var(--bg-color); }
                .timeline-card { background: var(--card-bg); border-radius: 1rem; border: 1px solid var(--border-color); display: flex; transition: all 0.3s ease; cursor: pointer; }
                .timeline-card:hover { transform: translateX(10px); box-shadow: var(--shadow); border-color: var(--accent-primary); }
                .card-accent-bar { width: 8px; }
                .card-accent-bar.status-scheduled { background-color: var(--accent-tertiary); }
                .card-accent-bar.status-completed { background-color: var(--accent-secondary); }
                .card-accent-bar.status-archived { background-color: var(--text-secondary); }
                .card-content { padding: 1.5rem; flex: 1; }
                .card-content h3 { font-size: 1.25rem; font-weight: 600; }
                .date-time, .reason { color: var(--text-secondary); }
                .card-status { padding: 1.5rem; display: grid; place-items: center; }
                .status-badge { padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
                .status-scheduled { background: rgba(251, 191, 36, 0.2); color: var(--accent-tertiary); }
                .status-completed { background-color: rgba(52, 211, 153, 0.2); color: var(--accent-secondary); }
                .status-archived { background-color: rgba(156, 163, 175, 0.2); color: var(--text-secondary); }
                .no-appointments { text-align: center; padding: 3rem; }
                .no-appointments svg { width: 48px; height: 48px; margin-bottom: 1rem; }
                
                /* MODAL & FORMS */
                .modal-backdrop { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.8); backdrop-filter: blur(5px); display: grid; place-items: center; z-index: 1000; }
                .modal-content { background: var(--card-bg); border-radius: 1rem; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; padding: 2.5rem; }
                .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
                .modal-header h2 { font-size: 1.75rem; }
                .form-section { margin-top: 2rem; }
                .form-section h3 { font-size: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
                .form-group label { font-weight: 500; }
                .form-group input, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--bg-color); color: var(--text-primary); }
                .prescription-fields { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 1rem; margin-bottom: 1rem; }
                .add-prescription-btn { background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; width: 100%; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
                .btn-primary, .btn-secondary { padding: 0.8rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
                .btn-primary { background: var(--accent-primary); color: var(--bg-dark); }
                .btn-secondary { background: #374151; color: var(--text-primary); }
                
                /* GENERAL */
                .theme-toggle { position: relative; background: var(--card-bg); border-radius: 50px; padding: 4px; display: flex; cursor: pointer; border: 1px solid var(--border-color); }
                .loading-state, .error-state { display: grid; place-content: center; height: 100%; font-size: 1.5rem; }
                .spinner { width: 56px; height: 56px; border: 6px solid var(--card-bg); border-bottom-color: var(--accent-primary); border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
                @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            
            <aside className="sidebar">
                <div className="sidebar-header"><div className="sidebar-logo">D</div><span className="sidebar-title">Doctor Portal</span></div>
                <nav className="nav-menu">
                    <div className={`nav-item ${view === 'active' && 'active'}`} onClick={() => setView('active')}><ClipboardIcon /><span>Upcoming</span></div>
                    <div className={`nav-item ${view === 'history' && 'active'}`} onClick={() => setView('history')}><HistoryIcon /><span>History</span></div>
                </nav>
                <footer className="sidebar-footer"><button onClick={handleLogout} className="logout-button"><LogoutIcon /><span>Logout</span></button></footer>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1>Your Dashboard</h1>
                    <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                </header>
                {renderContent()}
                {selectedAppointment && (
                    <Modal onClose={handleCloseModal}>
                        <div className="modal-header">
                            <h2>Consultation Report</h2>
                            <p>For {selectedAppointment.patient_first_name} {selectedAppointment.patient_last_name} on {new Date(selectedAppointment.appointment_date).toLocaleDateString()}</p>
                        </div>
                        {selectedAppointment.status === 'Scheduled' ? (
                            <>
                                <div className="form-section"><h3>Diagnosis</h3><div className="form-group"><label>Diagnosis Description</label><input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Common Cold" /></div><div className="form-group"><label>Additional Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Further details..."></textarea></div></div>
                                <div className="form-section"><h3>Prescriptions</h3>{prescriptions.map((p, index) => (<div key={index} className="prescription-fields"><input name="medication_name" value={p.medication_name} onChange={(e) => handlePrescriptionChange(index, e)} placeholder="Medication Name" /><input name="dosage" value={p.dosage} onChange={(e) => handlePrescriptionChange(index, e)} placeholder="Dosage (e.g., 500mg)" /><input name="instructions" value={p.instructions} onChange={(e) => handlePrescriptionChange(index, e)} placeholder="Instructions (e.g., Twice a day)" /></div>))}<button onClick={addPrescriptionField} className="add-prescription-btn">+ Add another prescription</button></div>
                                <div className="modal-actions"><button onClick={handleCloseModal} className="btn-secondary">Cancel</button><button onClick={handleSaveConsultation} className="btn-primary">Complete & Save</button></div>
                            </>
                        ) : (
                             <div className="modal-actions">
                                <p style={{ marginRight: 'auto', color: 'var(--text-secondary)'}}>This appointment is already completed.</p>
                                <button onClick={() => handleUpdateStatus(selectedAppointment.appointment_id, 'Archived')} className="btn-secondary">Archive</button>
                                <button onClick={handleCloseModal} className="btn-primary">Close</button>
                            </div>
                        )}
                    </Modal>
                )}
            </main>
        </div>
    );
}

export default DoctorDashboard;

