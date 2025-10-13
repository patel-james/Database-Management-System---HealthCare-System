const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- PATIENT-SPECIFIC ROUTES ---

// GET /api/patients/me (Get the logged-in patient's own profile with insurance)
router.get('/me', protect, async (req, res) => {
    const patient_id = req.user.profile_id;
    if (req.user.role !== 'Patient') {
        return res.status(403).json({ error: 'Unauthorized: This route is for patients only.' });
    }
    try {
        const sql = `
            SELECT 
                p.patient_id, p.first_name, p.last_name, p.date_of_birth, p.phone_number, 
                p.address, p.emergency_contact_name, p.emergency_contact_phone, p.insurance_id,
                u.email,
                i.insurance_provider, i.policy_number
            FROM Patients p
            JOIN Users u ON p.patient_id = u.patient_id
            LEFT JOIN Insurance i ON p.insurance_id = i.insurance_id
            WHERE p.patient_id = ?`;
        const [patients] = await db.query(sql, [patient_id]);
        if (patients.length === 0) {
            return res.status(404).json({ error: 'Patient profile not found.' });
        }
        res.json(patients[0]);
    } catch (error) {
        console.error('Failed to fetch patient profile:', error);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
});

// PUT /api/patients/me (Update the logged-in patient's own profile, including insurance)
router.put('/me', protect, async (req, res) => {
    const patient_id = req.user.profile_id;
     if (req.user.role !== 'Patient') {
        return res.status(403).json({ error: 'Unauthorized: This route is for patients only.' });
    }
    const {
        first_name, last_name, date_of_birth, phone_number,
        address, emergency_contact_name, emergency_contact_phone,
        insurance_id, // Now accepting insurance_id
        email, password
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const patientSql = `
            UPDATE Patients SET 
                first_name = ?, last_name = ?, date_of_birth = ?, phone_number = ?, 
                address = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
                insurance_id = ? 
            WHERE patient_id = ?`;
        await connection.query(patientSql, [
            first_name, last_name, date_of_birth, phone_number,
            address, emergency_contact_name, emergency_contact_phone,
            insurance_id, // Added to the query
            patient_id
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
            userValues.push(patient_id);
            const userSql = `UPDATE Users SET ${setClauses.join(', ')} WHERE patient_id = ?`;
            await connection.query(userSql, userValues);
        }

        await connection.commit();
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use.' });
        }
        console.error('Failed to update patient profile:', error);
        res.status(500).json({ error: 'Server error during profile update.' });
    } finally {
        connection.release();
    }
});


// --- ADMIN-ONLY ROUTES (No changes needed below this line for this feature) ---

// GET /api/patients (Get All Patients - Admin Only)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.*, u.email, i.insurance_provider
            FROM Patients p
            LEFT JOIN Users u ON p.patient_id = u.patient_id
            LEFT JOIN Insurance i ON p.insurance_id = i.insurance_id`;
        const [patients] = await db.query(sql);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching patient data.' });
    }
});

// POST /api/patients (Admin Creates New Patient)
router.post('/', protect, isAdmin, async (req, res) => {
    const {
        first_name, last_name, email, password, phone_number,
        date_of_birth, address, emergency_contact_name, emergency_contact_phone,
        insurance_id
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
            first_name, last_name, date_of_birth, phone_number,
            address, emergency_contact_name, emergency_contact_phone, insurance_id
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
        res.status(500).json({ error: 'Database error during patient creation.' });
    } finally {
        connection.release();
    }
});

// PUT /api/patients/:id (Admin Updates a Patient)
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, date_of_birth, phone_number,
        address, emergency_contact_name, emergency_contact_phone,
        insurance_id, email, password
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const patientSql = `
            UPDATE Patients SET 
                first_name = ?, last_name = ?, date_of_birth = ?, phone_number = ?, 
                address = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
                insurance_id = ?
            WHERE patient_id = ?`;
        await connection.query(patientSql, [
            first_name, last_name, date_of_birth, phone_number,
            address, emergency_contact_name, emergency_contact_phone, insurance_id, id
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
            return res.status(409).json({ error: 'This email is already in use.' });
        }
        res.status(500).json({ error: 'Database error during patient update.' });
    } finally {
        connection.release();
    }
});

// DELETE /api/patients/:id (Admin Deletes a Patient)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [appointments] = await connection.query('SELECT appointment_id FROM Appointments WHERE patient_id = ?', [id]);
        if (appointments.length > 0) {
            const appointmentIds = appointments.map(a => a.appointment_id);
            await connection.query('DELETE FROM Prescriptions WHERE appointment_id IN (?)', [appointmentIds]);
            await connection.query('DELETE FROM Diagnoses WHERE appointment_id IN (?)', [appointmentIds]);
        }
        await connection.query('DELETE FROM Appointments WHERE patient_id = ?', [id]);
        await connection.query('DELETE FROM Users WHERE patient_id = ?', [id]);
        const [result] = await connection.query('DELETE FROM Patients WHERE patient_id = ?', [id]);

        if (result.affectedRows === 0) throw new Error('Patient not found.');

        await connection.commit();
        res.json({ message: `Patient ID ${id} and all related data deleted successfully.` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message || 'Server error during deletion.' });
    } finally {
        connection.release();
    }
});

module.exports = router;

