const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const { protect } = require('../middleware/authMiddleware');

// --- DOCTOR-SPECIFIC ROUTE ---

// POST /api/diagnosis (Create New Diagnosis - Doctor Function)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'Doctor') {
        return res.status(403).json({ error: 'Not authorized to create a diagnosis.' });
    }
    const { appointment_id, diagnosis_description, notes } = req.body;
    if (!appointment_id || !diagnosis_description) {
        return res.status(400).json({ error: 'Appointment ID and diagnosis description are required.' });
    }
    try {
        const sql = 'INSERT INTO Diagnoses (appointment_id, diagnosis_description, notes) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [appointment_id, diagnosis_description, notes]);
        res.status(201).json({ message: 'New Diagnosis added successfully', diagnosis_id: result.insertId });
    } catch (error) {
        console.error('Failed to add new diagnosis:', error);
        res.status(500).json({ error: 'Failed to add new diagnosis.' });
    }
});


// --- PATIENT-SPECIFIC ROUTE ---

// GET /api/diagnosis/appointment/:appointmentId (Patient gets their own diagnosis for an appointment)
router.get('/appointment/:appointmentId', protect, async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id; // User ID from token
    
    try {
        // Security check: Ensure the appointment belongs to the logged-in user (or their doctor)
        const checkSql = `
            SELECT a.patient_id, a.doctor_id FROM Appointments a 
            JOIN Users u ON (a.patient_id = u.patient_id OR a.doctor_id = u.doctor_id)
            WHERE a.appointment_id = ? AND u.user_id = ?`;
        
        const [authCheck] = await db.query(checkSql, [appointmentId, userId]);
        
        if (authCheck.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view this diagnosis.' });
        }

        // Fetch the diagnosis
        const sql = 'SELECT * FROM Diagnoses WHERE appointment_id = ?';
        const [diagnoses] = await db.query(sql, [appointmentId]);
        res.json(diagnoses);

    } catch (error) {
        console.error('Failed to retrieve diagnosis by appointment:', error);
        res.status(500).json({ error: 'Failed to retrieve diagnosis.' });
    }
});


module.exports = router;
