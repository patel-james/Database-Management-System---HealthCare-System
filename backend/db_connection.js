// This file stores authentications for the mysql database 

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jamespatel',
    database: 'healthcare_db'
});

db.connect(err =>{
    if(err){
        console.error('Database Connection Failed: ' + err.stack);
        return;
    }
    console.log('Connection Successfull to MySQL database as id: '+ db.threadId);
});

module.exports = db;