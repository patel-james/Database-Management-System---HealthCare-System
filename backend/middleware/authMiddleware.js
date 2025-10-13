const jwt = require('jsonwebtoken');
const db = require('../db_connection');

const JWT_SECRET = 'your_strong_and_unique_jwt_secret_key';

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Get user from the database using the ID from the token
            // This ensures we always have the LATEST user data and profile IDs
            const sql = 'SELECT user_id, email, user_role, patient_id, doctor_id FROM Users WHERE user_id = ?';
            const [users] = await db.query(sql, [decoded.user_id]);

            if (users.length === 0) {
                return res.status(401).json({ error: 'Not authorized, user not found.' });
            }
            
            const user = users[0];

            // 4. Attach the full, up-to-date user object to the request
            req.user = {
                id: user.user_id, // Use a consistent name
                role: user.user_role,
                profile_id: user.user_role === 'Patient' ? user.patient_id : user.doctor_id
            };

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as an admin.' });
    }
};

module.exports = { protect, isAdmin };

