// This file recieves http requests from react
// handles server side operations
const express = require('express');

// handles requests over the website
const cors = require('cors');

// import the databse connection
const db = require('./db_connection');

// import the patients from routes
const patientsRouter = require('./routes/patients.js');
const doctorsRouter = require('./routes/doctors.js');
const appointmentsRouter = require('./routes/appointments.js');
const diagnosisRouter = require('./routes/diagnosis.js');
const prescriptionsRouter = require('./routes/prescriptions.js');
const authRouter = require('./routes/auth.js');
const insuranceRouter = require('./routes/insurance.js');

// creating an instance of express. (server object)
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// go to patients.js for all the patients endpoint requests
app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/diagnosis', diagnosisRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/insurance', insuranceRouter);

app.get('/', (req, res)=> {
    res.send('Backend is running');
});


app.listen(port, () => {
    console.log(`Backend server is listening at http://localhost:${port}`)
});