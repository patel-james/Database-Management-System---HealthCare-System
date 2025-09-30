const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// WARNING: Hardcoding a secret key is NOT RECOMMENDED for production systems.
// This is done ONLY for simplicity in a private local development environment.
const JWT_SECRET = 'HlF#5k@zT9yX8cW!dE$1rO0gH2jA4sQ6pL7iU3vB9nZ0mY1'; 

// NEW: Add a simple GET handler for testing the base path
router.get('/', (req, res) => {
    res.json({ 
        message: 'Authentication API is running.',
        available_endpoints: ['POST /api/auth/register', 'POST /api/auth/login']
    });
});

// --- REGISTRATION ROUTE (/api/auth/register) ---
router.post('/register', async (req, res) => {
    const { email, password, role, patient_id, doctor_id } = req.body;

    if (!email || !password || !role) {
        return res.status(400).send('Email, password, and role are required.');
    }

    try {
        // 1. Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Prepare the SQL query
        const sql = `
            INSERT INTO Users (email, password, role, patient_id, doctor_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [email, hashedPassword, role, patient_id || null, doctor_id || null];

        // 3. Execute the query
        db.query(sql, values, (err, result) => {
            if (err) {
                // Check for duplicate entry error (e.g., email already exists)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('User with this email already exists.');
                }
                console.error('Database Error during registration:', err);
                return res.status(500).send('Database error during registration.');
            }
            res.status(201).send('User registered successfully.');
        });
    } catch (error) {
        console.error('Server Error during registration:', error);
        res.status(500).send('Internal server error during registration.');
    }
});

// --- LOGIN ROUTE (/api/auth/login) ---
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 1. Find the user by email
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database Error during login:', err);
            return res.status(500).send('Database error during login.');
        }

        const user = results[0];
        if (!user) {
            return res.status(401).send('Invalid credentials.');
        }

        try {
            // 2. Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).send('Invalid credentials.');
            }

            // 3. Generate a JWT token
            const token = jwt.sign(
                { 
                    user_id: user.user_id, 
                    role: user.role,
                    patient_id: user.patient_id,
                    doctor_id: user.doctor_id
                }, 
                JWT_SECRET, 
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            // 4. Send the token back to the client
            res.json({ token, role: user.role, user_id: user.user_id });
        } catch (error) {
            console.error('Server Error during login:', error);
            res.status(500).send('Internal server error during login.');
        }
    });
});

module.exports = router;