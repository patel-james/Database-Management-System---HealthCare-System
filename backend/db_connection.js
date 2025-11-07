const mysql = require('mysql2/promise');
const isCloudRun = process.env.DB_HOST && process.env.DB_HOST.includes('/cloudsql/');

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ...(isCloudRun
    ? { socketPath: process.env.DB_HOST }  // for Cloud Run
    : { host: process.env.DB_HOST, port: 3306 }  // for local dev
  ),
  connectTimeout: 20000
});

console.log(`Connecting to Cloud SQL ${process.env.DB_NAME} via ${isCloudRun ? 'socket' : 'IP'}...`);
module.exports = pool;
