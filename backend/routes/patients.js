const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- GET /api/patients (Get All Patients with Email - Admin Only) ---
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.patient_id, p.first_name, p.last_name, p.date_of_birth, p.phone_number, 
                p.address, p.emergency_contact_name, p.emergency_contact_phone, p.insurance_id,
                u.email
            FROM Patients p
            LEFT JOIN Users u ON p.patient_id = u.patient_id`;
        const [patients] = await db.query(sql);
        res.json(patients);
    } catch (error) {
        console.error('Failed to fetch patients:', error);
        res.status(500).json({ error: 'Server error while fetching patient data.' });
    }
});

// --- POST /api/patients (Admin Creates New Patient) ---
router.post('/', protect, isAdmin, async (req, res) => {
    const {
        first_name, last_name, email, password, phone_number,
        date_of_birth, address, emergency_contact_name, emergency_contact_phone, insurance_id
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: first name, last name, email, password.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const patientSql = `
            INSERT INTO Patients (first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone, insurance_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [patientResult] = await connection.query(patientSql, [
            first_name, last_name, date_of_birth, phone_number, address,
            emergency_contact_name, emergency_contact_phone, insurance_id
        ]);
        const newPatientId = patientResult.insertId;

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userSql = `
            INSERT INTO Users (email, password_hash, user_role, patient_id)
            VALUES (?, ?, 'Patient', ?)`;
        await connection.query(userSql, [email, password_hash, newPatientId]);

        await connection.commit();
        res.status(201).json({ message: 'Patient and user account created successfully.' });

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use.' });
        }
        console.error('Admin failed to create patient:', error);
        res.status(500).json({ error: 'Database error during patient creation.' });
    } finally {
        connection.release();
    }
});

// --- PUT /api/patients/:id (Update Patient and User - Admin Only) ---
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, date_of_birth, phone_number, address,
        emergency_contact_name, emergency_contact_phone, insurance_id,
        email, password
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const patientSql = `
            UPDATE Patients SET 
            first_name = ?, last_name = ?, date_of_birth = ?, phone_number = ?, 
            address = ?, emergency_contact_name = ?, emergency_contact_phone = ?, insurance_id = ?
            WHERE patient_id = ?`;
        
        await connection.query(patientSql, [
            first_name, last_name, date_of_birth, phone_number, address,
            emergency_contact_name, emergency_contact_phone, insurance_id, id
        ]);

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
            const userSql = `UPDATE Users SET ${setClauses.join(', ')} WHERE patient_id = ?`;
            await connection.query(userSql, userValues);
        }

        await connection.commit();
        res.json({ message: 'Patient updated successfully.' });

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use by another account.' });
        }
        console.error('Failed to update patient:', error);
        res.status(500).json({ error: 'Database error during patient update.' });
    } finally {
        connection.release();
    }
});


// --- DELETE /api/patients/:id (Delete Patient and all related data - Admin Only) ---
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Find all appointments for the patient
        const [appointments] = await connection.query('SELECT appointment_id FROM Appointments WHERE patient_id = ?', [id]);
        
        if (appointments.length > 0) {
            const appointmentIds = appointments.map(a => a.appointment_id);
            
            // 2. Delete all prescriptions and diagnoses linked to those appointments
            await connection.query('DELETE FROM Prescriptions WHERE appointment_id IN (?)', [appointmentIds]);
            await connection.query('DELETE FROM Diagnoses WHERE appointment_id IN (?)', [appointmentIds]);
        }

        // 3. Delete all appointments for the patient
        await connection.query('DELETE FROM Appointments WHERE patient_id = ?', [id]);
        
        // 4. Delete the associated user account
        await connection.query('DELETE FROM Users WHERE patient_id = ?', [id]);
        
        // 5. Finally, delete the patient
        const [result] = await connection.query('DELETE FROM Patients WHERE patient_id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('Patient not found or already deleted.');
        }

        await connection.commit();
        res.json({ message: `Patient ID ${id} and all related data deleted successfully.` });

    } catch (error) {
        await connection.rollback();
        console.error(`Failed to delete patient ID ${id}:`, error);
        res.status(500).json({ error: error.message || 'Server error during deletion.' });
    } finally {
        connection.release();
    }
});

module.exports = router;

