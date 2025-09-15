const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// GET all doctors by running a SELECT * query
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Doctors';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching doctors:', err);
            res.status(500).send('Error fetching doctors.');
            return;
        }
        res.json(result);
    });
});

// POST a new doctor
router.post('/', (req, res) => {
    // Extract doctor details from the request body
    const { first_name, last_name, specialty, phone_number, email } = req.body;
    
    // SQL query to insert a new doctor into the Doctors table
    const sql = 'INSERT INTO Doctors (first_name, last_name, specialty, phone_number, email) VALUES (?, ?, ?, ?, ?)';
    
    // Execute the query with the provided values
    db.query(sql, [first_name, last_name, specialty, phone_number, email], (err, result) => {
        if (err) {
            console.error('Error adding new doctor:', err);
            res.status(500).send('Error adding new doctor.');
            return;
        }
        res.status(201).send('New Doctor Integrated Successfully!');
    });
});

module.exports = router;