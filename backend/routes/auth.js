const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

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
            
        // CHANGED: Converted from callback to async/await
        await db.query(sql, [email, password_hash]);
        
        res.status(201).send('Admin User registered successfully.');

    } catch (error) {
        // CHANGED: Moved error handling to the catch block
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
        
        // CHANGED: Converted from callback to async/await
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

        res.json({ 
            token, 
            role: user.user_role,
            profile_id: payload.profile_id
        });

    } catch (error) {
        // CHANGED: The try/catch block now handles database and other errors
        console.error('General error during login:', error);
        res.status(500).json({ message: 'Server error during login process' });
    }
});

// --- GET /api/auth (Test Route) ---
router.get('/', (req, res) => {
    res.send('Auth API is online. Use POST for /login or /register/admin.');
});

module.exports = router;