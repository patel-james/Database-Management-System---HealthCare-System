const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// GET all prescriptions
router.get('/', (req, res) => {
    // Fetches all columns from the Prescriptions table
    const sql = 'SELECT * FROM Prescriptions'; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching prescriptions:', err);
            // Send a 500 status and a friendly error message
            res.status(500).send('Error retrieving prescriptions from the database.'); 
            return;
        }
        res.json(result);
    });
});

// POST a new prescription
router.post('/', (req, res) => {
    // Destructure required fields matching your Prescriptions table structure
    const { 
        appointment_id, 
        medication_name, 
        dosage, 
        instructions
    } = req.body;

    // The SQL query to insert a new prescription
    const sql = `
        INSERT INTO Prescriptions 
        (appointment_id, medication_name, dosage, instructions) 
        VALUES (?, ?, ?, ?)
    `;
    
    // The values array to safely inject data into the query
    const values = [
        appointment_id, 
        medication_name, 
        dosage, 
        instructions
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating new prescription:', err);
            // This error will often be a foreign key constraint failure
            res.status(500).send('Failed to create new prescription. Check if appointment_id is valid.');
            return;
        }
        // Send a 201 Created status for successful insertion
        res.status(201).send('Prescription created successfully!');
    });
});

module.exports = router;