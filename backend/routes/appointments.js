const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// GET all appointments
router.get('/', (req, res) => {
    // Fetches all columns from the Appointments table
    const sql = 'SELECT * FROM Appointments'; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            res.status(500).send('Error retrieving appointments from the database.'); 
            return;
        }
        res.json(result);
    });
});

// POST a new appointment
router.post('/', (req, res) => {
    // Destructure required fields matching your Appointments table structure
    const {patient_id, doctor_id, appointment_date} = req.body;

    // The SQL query to insert a new appointment, excluding 'status' since it has a DEFAULT value
    const sql = `INSERT INTO Appointments (patient_id, doctor_id, appointment_date) VALUES (?, ?, ?)`;
    
    // The values array to safely inject data into the query
    const values = [patient_id, doctor_id, appointment_date];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating new appointment:', err);
            // This error will often be a foreign key constraint failure (e.g., patient_id doesn't exist)
            res.status(500).send('Failed to create new appointment. Check if patient_id and doctor_id are valid.');
            return;
        }
        // Send a 201 Created status for successful insertion
        res.status(201).send('Appointment created successfully!');
    });
});

module.exports = router;