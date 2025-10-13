import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

// --- SVG Icon Components ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const InsuranceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const LoadingSpinner = () => <div className="spinner"></div>;

// --- Components ---
const ThemeToggle = ({ theme, onToggle }) => ( <button onClick={onToggle} className="theme-toggle"><SunIcon className={`icon sun ${theme === 'light' ? 'active' : ''}`} /><MoonIcon className={`icon moon ${theme === 'dark' ? 'active' : ''}`} /></button> );
const Modal = ({ children, onClose }) => ( <div className="modal-backdrop"><div className="modal-content"><button onClick={onClose} className="modal-close-btn">&times;</button>{children}</div></div> );

// --- Main Patient Dashboard Component ---
function PatientDashboard() {
    const [profile, setProfile] = useState(null);
    const [activeAppointments, setActiveAppointments] = useState([]);
    const [historyAppointments, setHistoryAppointments] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    
    const [view, setView] = useState('appointments'); // 'appointments', 'history', 'profile', 'insurance', 'book'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [bookingDetails, setBookingDetails] = useState({ specialization: '', doctor_id: '', appointment_date: '', reason_for_visit: '' });
    const [insuranceForm, setInsuranceForm] = useState({ insurance_provider: '', policy_number: '' });
    const [feedbackDetails, setFeedbackDetails] = useState({ diagnosis: null, prescriptions: [], isLoading: false, appointmentId: null });
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const [theme, setTheme] = useState(() => localStorage.getItem('dashboardTheme') || 'dark');

    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('authToken');

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('dashboardTheme', newTheme);
    };

    const handleLogout = useCallback(() => { localStorage.clear(); navigate('/'); }, [navigate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { handleLogout(); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const [profileRes, activeAppointmentsRes, historyAppointmentsRes, specializationsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/patients/me`, config),
                axios.get(`${API_BASE_URL}/appointments/my-appointments`, config),
                axios.get(`${API_BASE_URL}/appointments/my-appointments/history`, config),
                axios.get(`${API_BASE_URL}/doctors/specializations`),
            ]);
            
            setProfile(profileRes.data);
            setActiveAppointments(activeAppointmentsRes.data);
            setHistoryAppointments(historyAppointmentsRes.data);
            setSpecializations(specializationsRes.data);
            setInsuranceForm({ insurance_provider: profileRes.data.insurance_provider || '', policy_number: profileRes.data.policy_number || '' });
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (bookingDetails.specialization) {
            const fetchDoctors = async () => {
                const res = await axios.get(`${API_BASE_URL}/doctors/specialization/${bookingDetails.specialization}`);
                setDoctors(res.data);
                setBookingDetails(prev => ({ ...prev, doctor_id: '' }));
            };
            fetchDoctors().catch(() => setError('Could not fetch doctors.'));
        } else {
            setDoctors([]);
        }
    }, [bookingDetails.specialization]);

    const handleOpenFeedbackModal = async (appointmentId) => {
        setIsFeedbackModalOpen(true);
        setFeedbackDetails({ diagnosis: null, prescriptions: [], isLoading: true, appointmentId: appointmentId });
        const token = getToken();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [diagRes, presRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/diagnosis/appointment/${appointmentId}`, config),
                axios.get(`${API_BASE_URL}/prescriptions/appointment/${appointmentId}`, config)
            ]);
            setFeedbackDetails({ diagnosis: diagRes.data[0], prescriptions: presRes.data, isLoading: false, appointmentId: appointmentId });
        } catch (err) {
            setFeedbackDetails({ diagnosis: null, prescriptions: [], isLoading: false, error: 'Could not load feedback.', appointmentId: appointmentId });
        }
    };

    const handleUpdateStatus = async (appointmentId, status) => {
        const token = getToken();
        try {
            await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData(); // Refresh both active and history lists
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || `Failed to update status.`}`);
        }
    };
    
    const handleSave = async (e, apiCall) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            alert("Error: Not authorized, no token.");
            return;
        }
        try {
            await apiCall();
            alert('Success!');
            fetchData();
            setView('appointments');
        } catch(err) {
            alert(`Error: ${err.response?.data?.error || 'Operation failed.'}`);
        }
    };
    
    // --- RENDER FUNCTIONS ---
    const renderAppointmentsList = (appointments, isHistory) => {
        if (appointments.length === 0) {
            return (
                <div className="no-appointments">
                    <CalendarIcon />
                    <h3>{isHistory ? 'No History Found' : 'No Upcoming Appointments'}</h3>
                    <p>{isHistory ? 'Your past consultations will appear here.' : 'Ready to book an appointment?'}</p>
                    {!isHistory && <button onClick={() => setView('book')} className="btn-primary">Book Now</button>}
                </div>
            );
        }

        return (
             <div className="appointments-timeline">
                {appointments.map((app, index) => (
                    <div key={app.appointment_id} className="timeline-item" style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-card">
                            <div className={`card-accent-bar status-${app.status?.toLowerCase()}`}></div>
                            <div className="card-content">
                                <div className="card-header">
                                    <div>
                                        <h3>Dr. {app.doctor_first_name} {app.doctor_last_name}</h3>
                                        <p className="specialization">{app.specialization}</p>
                                    </div>
                                    {app.status === 'Completed' || isHistory ? (
                                        <button className="btn-feedback" onClick={() => handleOpenFeedbackModal(app.appointment_id)}>
                                            <FileTextIcon/> View Feedback
                                        </button>
                                    ) : (
                                        <span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span>
                                    )}
                                </div>
                                <div className="card-body">
                                    <div className="info-item">
                                        <CalendarIcon />
                                        <span>{new Date(app.appointment_date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
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
        
        const config = { headers: { Authorization: `Bearer ${getToken()}` } };

        switch (view) {
            case 'profile': return profile && <div className="content-card form-view"><h2>My Profile</h2><p>Keep your personal information up to date.</p><form onSubmit={(e) => handleSave(e, () => axios.put(`${API_BASE_URL}/patients/me`, profile, config))}><div className="form-grid"><input name="first_name" value={profile.first_name || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="First Name" /><input name="last_name" value={profile.last_name || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Last Name" /><input name="email" type="email" value={profile.email || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Email" /><input name="password" type="password" onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="New Password (Optional)" /><input name="phone_number" value={profile.phone_number || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Phone Number" /><input name="date_of_birth" type="date" value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} /><input name="address" value={profile.address || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Address" /><input name="emergency_contact_name" value={profile.emergency_contact_name || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Emergency Contact" /><input name="emergency_contact_phone" value={profile.emergency_contact_phone || ''} onChange={(e) => setProfile(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Emergency Contact Phone" /></div><div className="form-actions"><button type="submit" className="btn-primary">Update Profile</button></div></form></div>;
            case 'insurance': return profile && <div className="content-card form-view"><h2>My Insurance</h2><p>Enter your insurance provider and policy number.</p><form onSubmit={(e) => handleSave(e, () => axios.post(`${API_BASE_URL}/insurance/my-insurance`, insuranceForm, config))}><div className="form-grid-single"><input name="insurance_provider" value={insuranceForm.insurance_provider} onChange={(e) => setInsuranceForm(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Insurance Provider" required /><input name="policy_number" value={insuranceForm.policy_number} onChange={(e) => setInsuranceForm(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Policy ID" required /></div><div className="form-actions"><button type="submit" className="btn-primary">Save Insurance</button></div></form></div>;
            case 'book': return <div className="content-card form-view"><h2>Book Appointment</h2><p>Find a specialist and book your visit.</p><form onSubmit={(e) => handleSave(e, () => axios.post(`${API_BASE_URL}/appointments`, bookingDetails, config))}><div className="form-grid"><select name="specialization" value={bookingDetails.specialization} onChange={(e) => setBookingDetails(prev => ({...prev, [e.target.name]: e.target.value}))} required><option value="">Select a Specialization...</option>{specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}</select><select name="doctor_id" value={bookingDetails.doctor_id} onChange={(e) => setBookingDetails(prev => ({...prev, [e.target.name]: e.target.value}))} required disabled={!bookingDetails.specialization}><option value="">Select a Doctor...</option>{doctors.map(doc => <option key={doc.doctor_id} value={doc.doctor_id}>Dr. {doc.first_name} {doc.last_name}</option>)}</select><input name="appointment_date" type="datetime-local" value={bookingDetails.appointment_date} onChange={(e) => setBookingDetails(prev => ({...prev, [e.target.name]: e.target.value}))} required /><textarea name="reason_for_visit" value={bookingDetails.reason_for_visit} onChange={(e) => setBookingDetails(prev => ({...prev, [e.target.name]: e.target.value}))} placeholder="Reason for Visit..." required rows="4" className="full-width"></textarea></div><div className="form-actions"><button type="button" onClick={() => setView('appointments')} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Book Now</button></div></form></div>;
            case 'history': return <div className="content-card"><div className="content-header"><h2>Appointment History</h2></div>{renderAppointmentsList(historyAppointments, true)}</div>;
            case 'appointments': default: return <div className="content-card"><div className="content-header"><h2>Upcoming Appointments</h2><button onClick={() => setView('book')} className="btn-primary"><PlusIcon /> New Appointment</button></div>{renderAppointmentsList(activeAppointments, false)}</div>;
        }
    };

    return (
        <div className={`patient-dashboard ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
            <div className="background-animation"></div>
            <style>{`
                /* FONT & THEME */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                .theme-light { --bg-color: #F9FAFB; --sidebar-bg: #FFFFFF; --card-bg: #FFFFFF; --text-primary: #111827; --text-secondary: #6B7280; --border-color: #E5E7EB; --accent-primary: #4F46E5; --accent-secondary: #10B981; --accent-primary-hover: #4338CA; --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .theme-dark { --bg-color: #0F172A; --sidebar-bg: rgba(30, 41, 59, 0.5); --card-bg: rgba(30, 41, 59, 0.7); --text-primary: #F8FAFC; --text-secondary: #94A3B8; --border-color: rgba(255, 255, 255, 0.1); --accent-primary: #22D3EE; --accent-secondary: #F472B6; --accent-primary-hover: #22D3EE; --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }

                /* BASE LAYOUT */
                .patient-dashboard { display: flex; min-height: 100vh; background-color: var(--bg-color); font-family: 'Poppins', sans-serif; color: var(--text-primary); transition: background-color 0.5s ease; }
                .theme-dark .background-animation { position: fixed; inset: 0; z-index: -1; background: linear-gradient(-45deg, #0F172A, #1E293B, #334155, #475569); background-size: 400% 400%; animation: gradientBG 15s ease infinite; }
                @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .sidebar { width: 260px; background: var(--sidebar-bg); backdrop-filter: blur(10px); border-right: 1px solid var(--border-color); padding: 2rem 1.5rem; display: flex; flex-direction: column; }
                .sidebar-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 3rem; }
                .sidebar-logo { background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary)); color: white; width: 40px; height: 40px; border-radius: 0.5rem; display: grid; place-items: center; font-weight: 700; font-size: 1.5rem; }
                .sidebar-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
                .nav-menu { display: flex; flex-direction: column; gap: 0.5rem; }
                .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 0.5rem; color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; }
                .theme-light .nav-item:hover { background-color: #F3F4F6; }
                .theme-dark .nav-item:hover { background-color: rgba(255,255,255,0.05); }
                .nav-item.active { color: white; background-color: var(--accent-primary); }
                .theme-dark .nav-item.active { border-color: var(--accent-primary); background-color: rgba(34, 211, 238, 0.1); color: var(--accent-primary); }
                .sidebar-footer { margin-top: auto; }
                .logout-button { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 0.75rem 1rem; background: none; border: none; color: var(--text-secondary); font-weight: 500; cursor: pointer; }
                .main-content { flex: 1; padding: 2.5rem; overflow: auto; }
                .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .main-header h1 { font-size: 2.25rem; font-weight: 700; }
                .main-header p { color: var(--text-secondary); }
                .content-card { background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid var(--border-color); border-radius: 1rem; box-shadow: var(--shadow); padding: 2.5rem; animation: slideInUp 0.5s ease-out; }
                .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .content-header h2 { font-size: 1.75rem; font-weight: 600; }

                /* BUTTONS */
                .btn-primary, .btn-secondary, .btn-feedback { padding: 0.8rem 1.5rem; border: 2px solid transparent; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem; }
                .btn-primary { background: var(--accent-primary); color: white; }
                .theme-dark .btn-primary { color: var(--bg-dark); }
                .btn-primary:hover { background: var(--accent-primary-hover); }
                .theme-dark .btn-primary:hover { background: transparent; border-color: var(--accent-primary); color: var(--accent-primary); box-shadow: 0 0 15px var(--accent-primary); }
                .btn-secondary { background: #E5E7EB; color: #374151; }
                .theme-dark .btn-secondary { background: #1E293B; color: var(--text-secondary); }
                .btn-feedback { background: var(--accent-secondary); color: white; padding: 0.5rem 1rem; font-size: 0.8rem; }
                .theme-dark .btn-feedback { color: var(--bg-dark); }
                
                /* APPOINTMENTS TIMELINE */
                .appointments-timeline { position: relative; padding-left: 2rem; }
                .appointments-timeline::before { content: ''; position: absolute; top: 0; left: 11px; height: 100%; width: 2px; background-color: var(--border-color); }
                .timeline-item { position: relative; margin-bottom: 1.5rem; animation: popIn 0.5s ease-out backwards; }
                .timeline-dot { position: absolute; top: 5px; left: -2rem; height: 1rem; width: 1rem; background-color: var(--accent-secondary); border-radius: 50%; border: 3px solid var(--bg-color); }
                .timeline-card { background: var(--card-bg); border-radius: 1rem; border: 1px solid var(--border-color); overflow: hidden; display: flex; transition: all 0.3s ease; }
                .timeline-card:hover { transform: translateX(10px); box-shadow: var(--shadow); border-color: var(--accent-primary); }
                .card-accent-bar { width: 8px; background-color: #FBBF24; } /* Yellow for scheduled */
                .card-accent-bar.status-completed { background-color: var(--accent-secondary); }
                .card-content { padding: 1.5rem; flex: 1; }
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .card-header h3 { font-size: 1.25rem; font-weight: 600; }
                .specialization { color: var(--accent-secondary); font-weight: 500; margin-top: 0.25rem; }
                .card-body { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .info-item { display: flex; align-items: center; gap: 0.75rem; color: var(--text-secondary); }
                .info-item svg { width: 20px; height: 20px; color: var(--accent-primary); }
                .no-appointments { text-align: center; padding: 3rem; }
                
                /* FORMS & MODALS */
                .form-view h2, .form-view p { text-align: center; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2.5rem; }
                .form-grid-single { display: grid; grid-template-columns: 1fr; gap: 1.5rem; max-width: 500px; margin: 2.5rem auto 0; }
                .form-grid .full-width { grid-column: 1 / -1; }
                .form-view input, .form-view select, .form-view textarea { width: 100%; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--bg-color); color: var(--text-primary); font-size: 1rem; }
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .modal-backdrop { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.8); backdrop-filter: blur(5px); display: grid; place-items: center; z-index: 1000; animation: fadeIn 0.3s ease; }
                .modal-content { background: var(--card-bg); border-radius: 1rem; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; padding: 2.5rem; animation: slideInUp 0.3s ease; }
                .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; }
                .feedback-section h3 { font-size: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
                .feedback-item { margin-bottom: 0.5rem; }
                .feedback-item strong { color: var(--accent-secondary); }
                
                /* THEME TOGGLE, LOADING, ETC. */
                .theme-toggle { position: relative; background: var(--card-bg); border-radius: 50px; padding: 4px; display: flex; cursor: pointer; border: 1px solid var(--border-color); }
                .theme-toggle .icon { transition: all 0.3s ease; padding: 4px; }
                .loading-state, .error-state { display: grid; place-content: center; height: 100%; font-size: 1.5rem; color: var(--text-secondary); }
                .spinner { width: 56px; height: 56px; border: 6px solid var(--card-bg); border-bottom-color: var(--accent-primary); border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
                @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            
            <aside className="sidebar">
                <div className="sidebar-header"><div className="sidebar-logo">H</div><span className="sidebar-title">Health Portal</span></div>
                <nav className="nav-menu">
                    <div className={`nav-item ${view === 'appointments' && 'active'}`} onClick={() => setView('appointments')}><CalendarIcon /><span>Upcoming</span></div>
                    <div className={`nav-item ${view === 'history' && 'active'}`} onClick={() => setView('history')}><HistoryIcon /><span>History</span></div>
                    <div className={`nav-item ${view === 'profile' && 'active'}`} onClick={() => setView('profile')}><ProfileIcon /><span>My Profile</span></div>
                    <div className={`nav-item ${view === 'insurance' && 'active'}`} onClick={() => setView('insurance')}><InsuranceIcon /><span>My Insurance</span></div>
                </nav>
                <footer className="sidebar-footer"><button onClick={handleLogout} className="logout-button"><LogoutIcon /><span>Logout</span></button></footer>
            </aside>
             <main className="main-content">
                <header className="main-header">
                    <div><h1>Welcome back, {profile?.first_name}!</h1><p>Here's your health summary.</p></div>
                    <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                </header>
                {renderContent()}
                {isFeedbackModalOpen && (
                    <Modal onClose={() => setIsFeedbackModalOpen(false)}>
                        <h2>Consultation Feedback</h2>
                        {feedbackDetails.isLoading ? <LoadingSpinner/> : feedbackDetails.error ? <p>{feedbackDetails.error}</p> : (
                            <div>
                                <div className="feedback-section"><h3>Diagnosis</h3><p>{feedbackDetails.diagnosis?.diagnosis_description || 'No diagnosis provided.'}</p>{feedbackDetails.diagnosis?.notes && <><strong>Notes:</strong><p>{feedbackDetails.diagnosis.notes}</p></>}</div>
                                <div className="feedback-section"><h3>Prescriptions</h3>{feedbackDetails.prescriptions.length > 0 ? (<ul>{feedbackDetails.prescriptions.map(p => (<li key={p.prescription_id} className="feedback-item"><strong>{p.medication_name}</strong> ({p.dosage}) - <span>{p.instructions}</span></li>))}</ul>) : <p>No prescriptions were issued.</p>}</div>
                                <div className="modal-actions">
                                    <button onClick={() => { handleUpdateStatus(feedbackDetails.appointmentId, 'Archived'); setIsFeedbackModalOpen(false); }} className="btn-secondary">Archive Appointment</button>
                                    <button onClick={() => setIsFeedbackModalOpen(false)} className="btn-primary">Close</button>
                                </div>
                            </div>
                        )}
                    </Modal>
                )}
            </main>
        </div>
    );
}

export default PatientDashboard;

