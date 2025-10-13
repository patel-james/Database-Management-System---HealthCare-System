const jwt = require('jsonwebtoken');
const db = require('../db_connection');

// Use the same secret key as in your auth.js
const JWT_SECRET = 'your_strong_and_unique_jwt_secret_key';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from the 'Bearer <token>' header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token is valid
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Get user info from DB using the ID in the token
            // We attach the user info to the request object for later use
            const [rows] = await db.query('SELECT user_id, user_role FROM Users WHERE user_id = ?', [decoded.user_id]);
            
            if (rows.length === 0) {
                 return res.status(401).json({ error: 'Not authorized, user not found.' });
            }

            req.user = rows[0];

            // 4. Move to the next function in the chain
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ error: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided.' });
    }
};

const isAdmin = (req, res, next) => {
    // This runs *after* protect, so req.user will exist
    if (req.user && req.user.user_role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
};

module.exports = { protect, isAdmin };

