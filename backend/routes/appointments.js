const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- DOCTOR-SPECIFIC ROUTES ---

// GET /api/appointments/doctor (Get ACTIVE appointments for the logged-in doctor)
router.get('/doctor', protect, async (req, res) => {
    const doctor_id = req.user.profile_id;
    if (req.user.role !== 'Doctor') {
        return res.status(403).json({ error: 'Unauthorized: This route is for doctors only.' });
    }
    try {
        const sql = `
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? AND a.status != 'Archived'
            ORDER BY a.appointment_date ASC`;
        const [appointments] = await db.query(sql, [doctor_id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching appointments.' });
    }
});

// GET /api/appointments/doctor/history (Get ARCHIVED appointments for the logged-in doctor)
router.get('/doctor/history', protect, async (req, res) => {
    const doctor_id = req.user.profile_id;
    if (req.user.role !== 'Doctor') {
        return res.status(403).json({ error: 'Unauthorized.' });
    }
    try {
        const sql = `
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? AND a.status = 'Archived'
            ORDER BY a.appointment_date DESC`;
        const [appointments] = await db.query(sql, [doctor_id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching history.' });
    }
});

// PUT /api/appointments/:id/status (Doctor/Patient updates an appointment's status)
router.put('/:id/status', protect, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { role, profile_id } = req.user;

    if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
    }

    try {
        const [appCheck] = await db.query('SELECT doctor_id, patient_id, status as current_status FROM Appointments WHERE appointment_id = ?', [id]);
        if (appCheck.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }
        const appointment = appCheck[0];

        // Security logic based on role
        if (role === 'Doctor' && appointment.doctor_id !== profile_id) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own appointments.' });
        }
        if (role === 'Patient' && appointment.patient_id !== profile_id) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own appointments.' });
        }
        if (role === 'Patient' && status !== 'Archived') {
            return res.status(403).json({ error: 'Patients can only archive appointments.' });
        }
         if (role === 'Patient' && appointment.current_status !== 'Completed') {
            return res.status(400).json({ error: 'Only completed appointments can be archived.' });
        }

        await db.query('UPDATE Appointments SET status = ? WHERE appointment_id = ?', [status, id]);
        res.json({ message: 'Appointment status updated successfully.' });

    } catch (error) {
        res.status(500).json({ error: 'Server error during status update.' });
    }
});


// --- PATIENT ROUTES ---

// POST /api/appointments (Patient creates a new appointment for themselves)
router.post('/', protect, async (req, res) => {
    const patient_id = req.user.profile_id; 
    const { doctor_id, appointment_date, reason_for_visit } = req.body;

    if (req.user.role !== 'Patient') {
        return res.status(403).json({ error: 'Unauthorized: Only patients can book appointments.' });
    }
    
    try {
        const sql = `INSERT INTO Appointments (patient_id, doctor_id, appointment_date, reason_for_visit, status) VALUES (?, ?, ?, ?, 'Scheduled')`;
        await db.query(sql, [patient_id, doctor_id, appointment_date, reason_for_visit]);
        res.status(201).json({ message: 'Appointment booked successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Database error during appointment creation.' });
    }
});

// GET /api/appointments/my-appointments (Patient gets their own ACTIVE appointments)
router.get('/my-appointments', protect, async (req, res) => {
    const patient_id = req.user.profile_id;
    if (req.user.role !== 'Patient') {
       return res.status(403).json({ error: 'Unauthorized.' });
    }
    try {
        const sql = `
            SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
            FROM Appointments a LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ? AND a.status != 'Archived' ORDER BY a.appointment_date DESC`;
        const [appointments] = await db.query(sql, [patient_id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching appointments.' });
    }
});

// GET /api/appointments/my-appointments/history (Patient gets their own ARCHIVED appointments)
router.get('/my-appointments/history', protect, async (req, res) => {
    const patient_id = req.user.profile_id;
    if (req.user.role !== 'Patient') {
       return res.status(403).json({ error: 'Unauthorized.' });
    }
    try {
        const sql = `
            SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
            FROM Appointments a LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ? AND a.status = 'Archived' ORDER BY a.appointment_date DESC`;
        const [appointments] = await db.query(sql, [patient_id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching appointment history.' });
    }
});


// --- ADMIN ROUTES ---
// Admin routes remain unchanged, omitted for brevity.

module.exports = router;

