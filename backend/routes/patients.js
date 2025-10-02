const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs'); 

// --- GET /api/patients (Get All Patients - Admin Function) ---
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Patients';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching patients:', err);
            return res.status(500).json({ error: 'Failed to retrieve patients.' });
        }
        res.json(result);
    });
});

// --- POST /api/patients (Create New Patient - Admin Function) ---
router.post('/', async (req, res) => {
    const {
        first_name, last_name, date_of_birth, 
        phone_number, address, emergency_contact_name, 
        emergency_contact_phone, insurance_id, 
        email, password 
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // START TRANSACTION
    db.getConnection((err, connection) => {
        if (err) return res.status(500).send('Database connection error.');

        connection.beginTransaction(async (err) => {
            if (err) { connection.release(); return res.status(500).send('Transaction error.'); }

            try {
                // 1. INSERT into Patients table
                const patientSql = `
                    INSERT INTO Patients 
                    (first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone, insurance_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const patientValues = [
                    first_name, last_name, date_of_birth, 
                    phone_number, address, emergency_contact_name, 
                    emergency_contact_phone, insurance_id
                ];

                connection.query(patientSql, patientValues, (err, patientResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Failed to create patient record.');
                        });
                    }

                    const newPatientId = patientResult.insertId;

                    // 2. INSERT into Users table
                    const userSql = `
                        INSERT INTO Users 
                        (email, password_hash, user_role, patient_id) 
                        VALUES (?, ?, 'Patient', ?)`;
                    
                    const userValues = [email, password_hash, newPatientId];

                    connection.query(userSql, userValues, (err, userResult) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Failed to create user credentials (email already in use?).');
                            });
                        }

                        // COMMIT
                        connection.commit((err) => {
                            connection.release();
                            if (err) return res.status(500).send('Transaction failed during commit.');
                            res.status(201).send(`New Patient (ID: ${newPatientId}) and User Account created successfully!`);
                        });
                    });
                });
            } catch (error) {
                connection.rollback(() => {
                    connection.release();
                    res.status(500).send('An unexpected error occurred during patient creation.');
                });
            }
        });
    });
});

module.exports = router;