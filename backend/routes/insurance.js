const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// --- GET /api/insurance (Get All Insurance Providers - Admin Function) ---
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Insurance';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve insurance data.' });
        res.json(result);
    });
});

// --- POST /api/insurance (Create New Insurance Provider - Admin Function) ---
router.post('/', (req, res) => {
    const { insurance_provider, policy_number } = req.body;
    const sql = 'INSERT INTO Insurance (insurance_provider, policy_number) VALUES (?, ?)';
    
    db.query(sql, [insurance_provider, policy_number], (err, result) => {
        if (err) return res.status(500).send('Failed to add new insurance provider.');
        res.status(201).send(`New Insurance Provider added successfully with ID: ${result.insertId}`);
    });
});

// --- PUT /api/insurance/:id (Update Insurance Provider - Admin Function) ---
router.put('/:id', (req, res) => {
    const insurance_id = req.params.id;
    const { insurance_provider, policy_number } = req.body;
    
    const sql = 'UPDATE Insurance SET insurance_provider = ?, policy_number = ? WHERE insurance_id = ?';
    
    db.query(sql, [insurance_provider, policy_number, insurance_id], (err, result) => {
        if (err) return res.status(500).send('Failed to update insurance provider.');
        if (result.affectedRows === 0) return res.status(404).send('Insurance provider not found.');
        res.send(`Insurance Provider ID ${insurance_id} updated successfully.`);
    });
});

// --- DELETE /api/insurance/:id (Delete Insurance Provider - Admin Function) ---
router.delete('/:id', (req, res) => {
    const insurance_id = req.params.id;
    const sql = 'DELETE FROM Insurance WHERE insurance_id = ?';
    
    db.query(sql, [insurance_id], (err, result) => {
        if (err) {
            // Check for foreign key conflict
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).send('Cannot delete: Policy is linked to patients.');
            }
            return res.status(500).send('Failed to delete insurance provider.');
        }
        if (result.affectedRows === 0) return res.status(404).send('Insurance provider not found.');
        res.send(`Insurance Provider ID ${insurance_id} deleted successfully.`);
    });
});

module.exports = router;