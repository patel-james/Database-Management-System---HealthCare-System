const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const { protect } = require('../middleware/authMiddleware');

// --- DOCTOR-SPECIFIC ROUTE ---

// POST /api/prescriptions (Create New Prescription - Doctor Function)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'Doctor') {
        return res.status(403).json({ error: 'Not authorized to create a prescription.' });
    }
    const { appointment_id, medication_name, dosage, instructions } = req.body;
    if (!appointment_id || !medication_name) {
        return res.status(400).json({ error: 'Appointment ID and medication name are required.' });
    }
    try {
        const sql = 'INSERT INTO Prescriptions (appointment_id, medication_name, dosage, instructions) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [appointment_id, medication_name, dosage, instructions]);
        res.status(201).json({ message: 'New Prescription added successfully', prescription_id: result.insertId });
    } catch (error) {
        console.error('Failed to add new prescription:', error);
        res.status(500).json({ error: 'Failed to add new prescription.' });
    }
});

// --- PATIENT/DOCTOR ROUTE ---

// GET /api/prescriptions/appointment/:appointmentId (Get prescriptions for a specific appointment)
router.get('/appointment/:appointmentId', protect, async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    
    try {
        // Security check: Ensure the appointment belongs to the logged-in user (patient or doctor)
        const checkSql = `
            SELECT a.patient_id FROM Appointments a 
            JOIN Users u ON (a.patient_id = u.patient_id OR a.doctor_id = u.doctor_id)
            WHERE a.appointment_id = ? AND u.user_id = ?`;
        
        const [authCheck] = await db.query(checkSql, [appointmentId, userId]);
        
        if (authCheck.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view these prescriptions.' });
        }

        // Fetch the prescriptions
        const sql = 'SELECT * FROM Prescriptions WHERE appointment_id = ?';
        const [prescriptions] = await db.query(sql, [appointmentId]);
        res.json(prescriptions);

    } catch (error) {
        console.error('Failed to retrieve prescriptions by appointment:', error);
        res.status(500).json({ error: 'Failed to retrieve prescriptions.' });
    }
});

module.exports = router;
