const express = require('express');
const router = express.Router();
const db = require('../db_connection');

// get all the patients by running Select all query
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Patients';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// post a new patient
router.post('/', (req, res) =>{
    const {first_name, last_name, date_of_birth, email, emergency_contact_name, emergency_contact_phone, insurance_id} = req.body;
    const sql = 'INSERT INTO Patients (first_name, last_name, date_of_birth, email, emergency_contact_name, emergency_contact_phone, insurance_id) VALUES (?,?,?,?,?,?,?)';
    db.query(sql, [first_name, last_name, date_of_birth, email, emergency_contact_name, emergency_contact_phone, insurance_id], (err, result) => {
        if (err) throw err;
        res.send('New Patient Integrated Successfully!')
    });
});

module.exports = router;