// This file receives http requests from React
// handles server-side operations
const express = require('express');
const cors = require('cors');

// --- Add this right below imports ---
console.log("🧩 ENV CHECK:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});
// ------------------------------------

// import the database connection
const db = require('./db_connection');

// import the routes
const patientsRouter = require('./routes/patients.js');
const doctorsRouter = require('./routes/doctors.js');
const appointmentsRouter = require('./routes/appointments.js');
const diagnosisRouter = require('./routes/diagnosis.js');
const prescriptionsRouter = require('./routes/prescriptions.js');
const authRouter = require('./routes/auth.js');
const insuranceRouter = require('./routes/insurance.js');

// creating an instance of express (server object)
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// route setup
app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/diagnosis', diagnosisRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/insurance', insuranceRouter);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(port, () => {
  console.log(`Backend server is listening at http://localhost:${port}`);
});
