const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// ***IMPORTANT: Use a proper environment variable for this in a real environment***
const JWT_SECRET = 'your_strong_and_unique_jwt_secret_key'; 

// --- POST /api/auth/register/admin (Initial Setup) ---
router.post('/register/admin', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO Users 
            (email, password_hash, user_role) 
            VALUES (?, ?, 'Admin')`;
            
        db.query(sql, [email, password_hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already in use.' });
                }
                console.error('Admin registration failed:', err);
                return res.status(500).json({ error: 'Failed to register Admin user.' });
            }
            res.status(201).send('Admin User registered successfully.');
        });
    } catch (error) {
        console.error('Error during admin registration:', error);
        res.status(500).json({ error: 'Server error during password hashing.' });
    }
});

// --- POST /api/auth/login (Main Login Endpoint) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = 'SELECT * FROM Users WHERE email = ?';
        db.query(sql, [email], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Server error.' });
            
            const user = rows[0];

            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const payload = {
                user_id: user.user_id,
                role: user.user_role,
                profile_id: user.user_role === 'Patient' ? user.patient_id : user.doctor_id 
            };
            
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            res.json({ 
                token, 
                role: user.user_role,
                profile_id: payload.profile_id
            });
        });

    } catch (error) {
        console.error('General error during login:', error);
        res.status(500).json({ message: 'Server error during login process' });
    }
});

// --- GET /api/auth (Test Route) ---
router.get('/', (req, res) => {
    res.send('Auth API is online. Use POST for /login or /register/admin.');
});

module.exports = router;