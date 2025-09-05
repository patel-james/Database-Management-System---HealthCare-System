// handles server side operations
const express = require('express');
// handles the interaction with mysql
const mysql = require('mysql2');
// handles requests over the website
const cors = require('cors');


// creating an instance of express. (server object)
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Setting up mysql connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jamespatel',
    database: 'healthcare_db'
});
// Test connection
db.connect(err => {
    if(err){
        console.error('Database connection Error' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id' + db.threadId);
});

app.get('/', (req, res)=> {
    res.send('Backend Is UP & Running!');
});
// endpoint to get all the patients
app.get('/api/patients', (req,res) => {
    const sql = 'SELECT * FROM Patients';
    db.query(sql, (err, result) =>{
        if (err) {
            console.error('Error getting patients: ' + err.stack);
            return res.status(500).send('Error getting data');
        }
        res.json(result);
    });
});

app.listen(port, () => {
    console.log(`Backend server is listening at http://localhost:${port}`)
});