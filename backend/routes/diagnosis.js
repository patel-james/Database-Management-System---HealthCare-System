const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// --- GET /api/diagnosis (Get All Diagnoses - Admin Function) ---
router.get('/', (req, res) => {
    const sql = `
        SELECT d.*, a.appointment_date, a.patient_id
        FROM Diagnoses d
        JOIN Appointments a ON d.appointment_id = a.appointment_id
        ORDER BY a.appointment_date DESC`;
    
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve all diagnoses.' });
        res.json(result);
    });
});

// --- GET /api/diagnosis/appointment/:appointmentId ---
router.get('/appointment/:appointmentId', (req, res) => {
    const appointmentId = req.params.appointmentId;
    const sql = 'SELECT * FROM Diagnoses WHERE appointment_id = ?';
    
    db.query(sql, [appointmentId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve diagnoses by appointment.' });
        res.json(result);
    });
});

// --- GET /api/diagnosis/patient/:patientId (History) ---
router.get('/patient/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    const sql = `
        SELECT d.*, a.appointment_date 
        FROM Diagnoses d
        JOIN Appointments a ON d.appointment_id = a.appointment_id
        WHERE a.patient_id = ? 
        ORDER BY a.appointment_date DESC`;
    
    db.query(sql, [patientId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve patient diagnoses history.' });
        res.json(result);
    });
});

// --- POST /api/diagnosis (Create New Diagnosis - Doctor Function) ---
router.post('/', (req, res) => {
    const { appointment_id, diagnosis_description, notes } = req.body;
    const sql = 'INSERT INTO Diagnoses (appointment_id, diagnosis_description, notes) VALUES (?, ?, ?)';
    
    db.query(sql, [appointment_id, diagnosis_description, notes], (err, result) => {
        if (err) return res.status(500).send('Failed to add new diagnosis.');
        res.status(201).send(`New Diagnosis added successfully with ID: ${result.insertId}`);
    });
});

// --- PUT /api/diagnosis/:id (Update Diagnosis - Doctor Function) ---
router.put('/:id', (req, res) => {
    const diagnosis_id = req.params.id;
    const { diagnosis_description, notes } = req.body;
    
    const sql = 'UPDATE Diagnoses SET diagnosis_description = ?, notes = ? WHERE diagnosis_id = ?';
    
    db.query(sql, [diagnosis_description, notes, diagnosis_id], (err, result) => {
        if (err) return res.status(500).send('Failed to update diagnosis.');
        if (result.affectedRows === 0) return res.status(404).send('Diagnosis not found.');
        res.send(`Diagnosis ID ${diagnosis_id} updated successfully.`);
    });
});

// --- DELETE /api/diagnosis/:id (Doctor/Admin Function) ---
router.delete('/:id', (req, res) => {
    const diagnosis_id = req.params.id;
    const sql = 'DELETE FROM Diagnoses WHERE diagnosis_id = ?';
    
    db.query(sql, [diagnosis_id], (err, result) => {
        if (err) return res.status(500).send('Failed to delete diagnosis.');
        if (result.affectedRows === 0) return res.status(404).send('Diagnosis not found.');
        res.send(`Diagnosis ID ${diagnosis_id} deleted successfully.`);
    });
});

module.exports = router;