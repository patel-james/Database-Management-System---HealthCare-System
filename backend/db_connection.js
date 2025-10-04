const mysql = require('mysql2');

// Create a pool instead of a single connection
const pool = mysql.createPool({
    connectionLimit: 10, // Max number of connections in the pool
    host: 'localhost',
    user: 'root',
    password: 'jamespatel',
    database: 'healthcare_db'
});

// The pool will handle connections and disconnections automatically
console.log('Connection Pool created successfully for healthcare_db.');

// Export the pool promise-based wrapper
module.exports = pool.promise();