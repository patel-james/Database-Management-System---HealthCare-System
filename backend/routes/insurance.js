const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// --- GET all insurance plans ---
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Insurance'; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching insurance plans:', err);
            res.status(500).send('Error retrieving insurance plans from the database.'); 
            return;
        }
        res.json(result);
    });
});

// --- POST a new insurance plan ---
router.post('/', (req, res) => {
    // Destructure required fields matching your Insurance table structure
    const { 
        insurance_provider, 
        policy_number
    } = req.body;

    // The SQL query to insert a new insurance plan
    const sql = `
        INSERT INTO Insurance 
        (insurance_provider, policy_number) 
        VALUES (?, ?)
    `;
    
    // The values array to safely inject data into the query
    const values = [
        insurance_provider, 
        policy_number
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating new insurance plan:', err);
            res.status(500).send('Failed to create new insurance plan.');
            return;
        }
        // Send a 201 Created status for successful insertion
        res.status(201).send('Insurance plan created successfully!');
    });
});

module.exports = router;