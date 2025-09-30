const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// GET all diagnoses
router.get('/', (req, res) => {
    // Fetches all columns from the Diagnoses table
    const sql = 'SELECT * FROM Diagnoses'; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching diagnoses:', err);
            // Send a 500 status and a friendly error message
            res.status(500).send('Error retrieving diagnoses from the database.'); 
            return;
        }
        res.json(result);
    });
});

// POST a new diagnosis
router.post('/', (req, res) => {
    // Destructure required fields matching your Diagnoses table structure
    const { 
        appointment_id, 
        diagnosis_description, 
        notes
    } = req.body;

    // The SQL query to insert a new diagnosis
    const sql = `
        INSERT INTO Diagnoses 
        (appointment_id, diagnosis_description, notes) 
        VALUES (?, ?, ?)
    `;
    
    // The values array to safely inject data into the query
    const values = [
        appointment_id, 
        diagnosis_description, 
        notes
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating new diagnosis:', err);
            // This error will often be a foreign key constraint failure (e.g., appointment_id doesn't exist)
            res.status(500).send('Failed to create new diagnosis. Check if appointment_id is valid.');
            return;
        }
        // Send a 201 Created status for successful insertion
        res.status(201).send('Diagnosis record created successfully!');
    });
});

module.exports = router;