const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- GET /api/doctors (Get All Doctors with Email - Admin Only) ---
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT 
                d.doctor_id, d.first_name, d.last_name, d.specialization, d.phone_number,
                u.email
            FROM Doctors d
            LEFT JOIN Users u ON d.doctor_id = u.doctor_id`;
        const [doctors] = await db.query(sql);
        res.json(doctors);
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        res.status(500).json({ error: 'Server error while fetching doctor data.' });
    }
});

// --- POST /api/doctors (Admin Creates New Doctor) ---
router.post('/', protect, isAdmin, async (req, res) => {
    const {
        first_name, last_name, email, password, phone_number, specialization
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: first name, last name, email, password.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const doctorSql = `
            INSERT INTO Doctors (first_name, last_name, specialization, phone_number)
            VALUES (?, ?, ?, ?)`;
        const [doctorResult] = await connection.query(doctorSql, [
            first_name, last_name, specialization, phone_number
        ]);
        const newDoctorId = doctorResult.insertId;

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userSql = `
            INSERT INTO Users (email, password_hash, user_role, doctor_id)
            VALUES (?, ?, 'Doctor', ?)`;
        await connection.query(userSql, [email, password_hash, newDoctorId]);

        await connection.commit();
        res.status(201).json({ message: 'Doctor and user account created successfully.' });

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use.' });
        }
        console.error('Admin failed to create doctor:', error);
        res.status(500).json({ error: 'Database error during doctor creation.' });
    } finally {
        connection.release();
    }
});

// --- PUT /api/doctors/:id (Update Doctor and User - Admin Only) ---
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, specialization, phone_number,
        email, password
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const doctorSql = `
            UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, phone_number = ?
            WHERE doctor_id = ?`;
        await connection.query(doctorSql, [first_name, last_name, specialization, phone_number, id]);

        const setClauses = [];
        const userValues = [];

        if (email) {
            setClauses.push('email = ?');
            userValues.push(email);
        }
        if (password) { 
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            setClauses.push('password_hash = ?');
            userValues.push(password_hash);
        }

        if (setClauses.length > 0) {
            userValues.push(id);
            const userSql = `UPDATE Users SET ${setClauses.join(', ')} WHERE doctor_id = ?`;
            await connection.query(userSql, userValues);
        }

        await connection.commit();
        res.json({ message: 'Doctor updated successfully.' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use by another account.' });
        }
        console.error('Failed to update doctor:', error);
        res.status(500).json({ error: 'Database error during doctor update.' });
    } finally {
        connection.release();
    }
});

// --- DELETE /api/doctors/:id (Delete Doctor and all related data - Admin Only) ---
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Find all appointments for the doctor
        const [appointments] = await connection.query('SELECT appointment_id FROM Appointments WHERE doctor_id = ?', [id]);
        
        if (appointments.length > 0) {
            const appointmentIds = appointments.map(a => a.appointment_id);
            
            // 2. Delete all prescriptions and diagnoses linked to those appointments
            await connection.query('DELETE FROM Prescriptions WHERE appointment_id IN (?)', [appointmentIds]);
            await connection.query('DELETE FROM Diagnoses WHERE appointment_id IN (?)', [appointmentIds]);
        }

        // 3. Delete all appointments for the doctor
        await connection.query('DELETE FROM Appointments WHERE doctor_id = ?', [id]);
        
        // 4. Delete the associated user account
        await connection.query('DELETE FROM Users WHERE doctor_id = ?', [id]);
        
        // 5. Finally, delete the doctor
        const [result] = await connection.query('DELETE FROM Doctors WHERE doctor_id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('Doctor not found or already deleted.');
        }

        await connection.commit();
        res.json({ message: `Doctor ID ${id} and all related data deleted successfully.` });

    } catch (error) {
        await connection.rollback();
        console.error(`Failed to delete doctor ID ${id}:`, error);
        res.status(500).json({ error: error.message || 'Server error during deletion.' });
    } finally {
        connection.release();
    }
});

module.exports = router;

