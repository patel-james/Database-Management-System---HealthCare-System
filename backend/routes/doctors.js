const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs'); 

// --- GET /api/doctors (Get All Doctors) ---
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Doctors';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve doctors.' });
        res.json(result);
    });
});

// --- POST /api/doctors (Create New Doctor - Admin Function) ---
router.post('/', async (req, res) => {
    const {
        first_name, last_name, specialization, phone_number,
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
                // 1. INSERT into Doctors table
                const doctorSql = `
                    INSERT INTO Doctors 
                    (first_name, last_name, specialization, phone_number) 
                    VALUES (?, ?, ?, ?)`;
                
                const doctorValues = [first_name, last_name, specialization, phone_number];

                connection.query(doctorSql, doctorValues, (err, doctorResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Failed to create doctor profile.');
                        });
                    }

                    const newDoctorId = doctorResult.insertId;

                    // 2. INSERT into Users table
                    const userSql = `
                        INSERT INTO Users 
                        (email, password_hash, user_role, doctor_id) 
                        VALUES (?, ?, 'Doctor', ?)`;
                    
                    const userValues = [email, password_hash, newDoctorId];

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
                            res.status(201).send(`New Doctor (ID: ${newDoctorId}) and User Account created successfully!`);
                        });
                    });
                });
            } catch (error) {
                connection.rollback(() => {
                    connection.release();
                    res.status(500).send('An unexpected error occurred.');
                });
            }
        });
    });
});

// --- PUT /api/doctors/:id (Update Doctor Profile - Admin Function) ---
router.put('/:id', (req, res) => {
    const doctor_id = req.params.id;
    const { first_name, last_name, specialization, phone_number } = req.body;
    
    const sql = `
        UPDATE Doctors 
        SET first_name = ?, last_name = ?, specialization = ?, phone_number = ?
        WHERE doctor_id = ?`;
    
    db.query(sql, [first_name, last_name, specialization, phone_number, doctor_id], (err, result) => {
        if (err) return res.status(500).send('Failed to update doctor profile.');
        if (result.affectedRows === 0) return res.status(404).send('Doctor not found.');
        res.send(`Doctor ID ${doctor_id} updated successfully.`);
    });
});

// --- DELETE /api/doctors/:id (Delete Doctor - Admin Function) ---
router.delete('/:id', (req, res) => {
    const doctor_id = req.params.id;
    
    // Deleting the Doctor requires deleting the linked User record first due to FK constraints.
    const deleteUserSql = 'DELETE FROM Users WHERE doctor_id = ?';
    const deleteDoctorSql = 'DELETE FROM Doctors WHERE doctor_id = ?';
    
    db.query(deleteUserSql, [doctor_id], (err, userResult) => {
        if (err) return res.status(500).send('Failed to delete related user credentials.');
        
        db.query(deleteDoctorSql, [doctor_id], (err, doctorResult) => {
            if (err) return res.status(500).send('Failed to delete doctor profile.');
            if (doctorResult.affectedRows === 0) return res.status(404).send('Doctor not found (or already deleted).');
            res.send(`Doctor ID ${doctor_id} and associated User account deleted successfully.`);
        });
    });
});

module.exports = router;