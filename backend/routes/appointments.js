const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// --- GET /api/appointments (Get All Appointments - Admin Function) ---
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Appointments';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve appointments.' });
        res.json(result);
    });
});

// --- GET /api/appointments/patient/:patientId ---
router.get('/patient/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    const sql = 'SELECT * FROM Appointments WHERE patient_id = ? ORDER BY appointment_date DESC';
    
    db.query(sql, [patientId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve patient appointments.' });
        res.json(result);
    });
});

// --- POST /api/appointments (Create New Appointment - Admin/Doctor Function) ---
router.post('/', (req, res) => {
    const { patient_id, doctor_id, appointment_date, reason_for_visit } = req.body;
    
    const sql = `
        INSERT INTO Appointments 
        (patient_id, doctor_id, appointment_date, reason_for_visit) 
        VALUES (?, ?, ?, ?)`;
    
    const values = [patient_id, doctor_id, appointment_date, reason_for_visit];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Appointment conflict: Doctor is already scheduled on this date.' });
            return res.status(500).send('Failed to create new appointment.');
        }
        res.status(201).send(`New Appointment created successfully with ID: ${result.insertId}`);
    });
});

// --- PUT /api/appointments/:id/status (Update Appointment Status) ---
router.put('/:id/status', (req, res) => {
    const appointment_id = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(status)) return res.status(400).send('Invalid status provided.');

    const sql = 'UPDATE Appointments SET status = ? WHERE appointment_id = ?';
    
    db.query(sql, [status, appointment_id], (err, result) => {
        if (err) return res.status(500).send('Failed to update appointment status.');
        if (result.affectedRows === 0) return res.status(404).send('Appointment not found.');
        res.send(`Appointment ID ${appointment_id} status updated to ${status}.`);
    });
});

// --- DELETE /api/appointments/:id (Delete Appointment - Requires Transaction) ---
router.delete('/:id', (req, res) => {
    const appointment_id = req.params.id;
    
    // Transaction required to delete child records (Prescriptions, Diagnoses) first.
    db.getConnection((err, connection) => {
        if (err) return res.status(500).send('Database connection error.');

        connection.beginTransaction((err) => {
            if (err) { connection.release(); return res.status(500).send('Transaction error.'); }

            // 1. Delete associated Prescriptions
            connection.query('DELETE FROM Prescriptions WHERE appointment_id = ?', [appointment_id], (err) => {
                if (err) return connection.rollback(() => { connection.release(); res.status(500).send('Failed to delete prescriptions.'); });
                
                // 2. Delete associated Diagnoses
                connection.query('DELETE FROM Diagnoses WHERE appointment_id = ?', [appointment_id], (err) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).send('Failed to delete diagnoses.'); });

                    // 3. Delete the Appointment itself
                    connection.query('DELETE FROM Appointments WHERE appointment_id = ?', [appointment_id], (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send('Failed to delete appointment.'); });

                        connection.commit((err) => {
                            connection.release();
                            if (err) return res.status(500).send('Transaction commit failed.');
                            if (result.affectedRows === 0) return res.status(404).send('Appointment not found.');
                            res.send(`Appointment ID ${appointment_id} and all related records deleted successfully.`);
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;