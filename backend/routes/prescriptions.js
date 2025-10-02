const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// --- GET /api/prescriptions (Get All Prescriptions - Admin Function) ---
router.get('/', (req, res) => {
    const sql = `
        SELECT p.*, a.appointment_date, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, a.patient_id
        FROM Prescriptions p
        JOIN Appointments a ON p.appointment_id = a.appointment_id
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        ORDER BY a.appointment_date DESC`;
    
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve all prescriptions.' });
        res.json(result);
    });
});

// --- GET /api/prescriptions/appointment/:appointmentId ---
router.get('/appointment/:appointmentId', (req, res) => {
    const appointmentId = req.params.appointmentId;
    const sql = 'SELECT * FROM Prescriptions WHERE appointment_id = ?';
    
    db.query(sql, [appointmentId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve prescriptions by appointment.' });
        res.json(result);
    });
});

// --- GET /api/prescriptions/patient/:patientId (History) ---
router.get('/patient/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    const sql = `
        SELECT p.*, a.appointment_date 
        FROM Prescriptions p
        JOIN Appointments a ON p.appointment_id = a.appointment_id
        WHERE a.patient_id = ? 
        ORDER BY a.appointment_date DESC`;
    
    db.query(sql, [patientId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve patient prescriptions.' });
        res.json(result);
    });
});

// --- POST /api/prescriptions (Create New Prescription - Doctor Function) ---
router.post('/', (req, res) => {
    const { appointment_id, medication_name, dosage, instructions } = req.body;
    const sql = 'INSERT INTO Prescriptions (appointment_id, medication_name, dosage, instructions) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [appointment_id, medication_name, dosage, instructions], (err, result) => {
        if (err) return res.status(500).send('Failed to add new prescription.');
        res.status(201).send(`New Prescription added successfully with ID: ${result.insertId}`);
    });
});

// --- PUT /api/prescriptions/:id (Update Prescription - Doctor Function) ---
router.put('/:id', (req, res) => {
    const prescription_id = req.params.id;
    const { medication_name, dosage, instructions } = req.body;
    
    const sql = 'UPDATE Prescriptions SET medication_name = ?, dosage = ?, instructions = ? WHERE prescription_id = ?';
    
    db.query(sql, [medication_name, dosage, instructions, prescription_id], (err, result) => {
        if (err) return res.status(500).send('Failed to update prescription.');
        if (result.affectedRows === 0) return res.status(404).send('Prescription not found.');
        res.send(`Prescription ID ${prescription_id} updated successfully.`);
    });
});

// --- DELETE /api/prescriptions/:id (Doctor Function) ---
router.delete('/:id', (req, res) => {
    const prescription_id = req.params.id;
    const sql = 'DELETE FROM Prescriptions WHERE prescription_id = ?';
    
    db.query(sql, [prescription_id], (err, result) => {
        if (err) return res.status(500).send('Failed to delete prescription.');
        if (result.affectedRows === 0) return res.status(404).send('Prescription not found.');
        res.send(`Prescription ID ${prescription_id} deleted successfully.`);
    });
});

module.exports = router;