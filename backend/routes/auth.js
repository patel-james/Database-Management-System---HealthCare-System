const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const JWT_SECRET = 'your_strong_and_unique_jwt_secret_key';

// --- POST /api/auth/register (Handles Patient and Doctor Signup) ---
router.post('/register', async (req, res) => {
    const { role, email, password, ...profileData } = req.body;

    if (!['Patient', 'Doctor'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Get a connection from the pool to handle the transaction
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        let profileInsertId;

        // --- Step 1: Insert into the role-specific table (Patients or Doctors) ---
        if (role === 'Patient') {
            const { first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone } = profileData;
            const patientSql = `
                INSERT INTO Patients (first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const [patientResult] = await connection.query(patientSql, [first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone]);
            profileInsertId = patientResult.insertId;
        } else if (role === 'Doctor') {
            const { first_name, last_name, specialization, phone_number } = profileData;
            const doctorSql = `
                INSERT INTO Doctors (first_name, last_name, specialization, phone_number) 
                VALUES (?, ?, ?, ?)`;
            const [doctorResult] = await connection.query(doctorSql, [first_name, last_name, specialization, phone_number]);
            profileInsertId = doctorResult.insertId;
        }

        // --- Step 2: Insert into the Users table, linking to the new profile ---
        const userSql = `
            INSERT INTO Users (email, password_hash, user_role, patient_id, doctor_id) 
            VALUES (?, ?, ?, ?, ?)`;
        const patientId = role === 'Patient' ? profileInsertId : null;
        const doctorId = role === 'Doctor' ? profileInsertId : null;

        await connection.query(userSql, [email, password_hash, role, patientId, doctorId]);

        // If both inserts were successful, commit the transaction
        await connection.commit();
        res.status(201).send(`${role} account created successfully.`);

    } catch (error) {
        // If there's an error, rollback the transaction
        if (connection) await connection.rollback();
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email address is already in use.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration.' });
    } finally {
        // Always release the connection back to the pool
        if (connection) connection.release();
    }
});

// --- POST /api/auth/register/admin (Initial Setup) ---
router.post('/register/admin', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const sql = `INSERT INTO Users (email, password_hash, user_role) VALUES (?, ?, 'Admin')`;
        await db.query(sql, [email, password_hash]);
        res.status(201).send('Admin User registered successfully.');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        console.error('Error during admin registration:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- POST /api/auth/login (Main Login Endpoint) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const sql = 'SELECT * FROM Users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user_id: user.user_id,
            role: user.user_role,
            profile_id: user.user_role === 'Patient' ? user.patient_id : user.doctor_id 
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.user_role, profile_id: payload.profile_id });
    } catch (error) {
        console.error('General error during login:', error);
        res.status(500).json({ message: 'Server error during login process' });
    }
});

module.exports = router;

