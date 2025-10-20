# Healthcare Database Management System

A full-stack web application for healthcare management with role-based access control, built using React.js, Node.js, Express.js, and MySQL.

## 🏥 Features

### Role-Based Access Control
- **Admin**: Full system management, user creation, and data oversight
- **Doctor**: Appointment management, patient consultation, diagnosis recording
- **Patient**: Appointment booking, medical history viewing, profile management

### Core Functionality
- User authentication and authorization
- Patient and doctor registration
- Appointment scheduling and management
- Medical diagnosis and prescription recording
- Insurance information management
- Responsive design with theme switching
- Real-time data updates

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern design patterns

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL2** - Database driver
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database management system

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <https://github.com/patel-james/Database-Management-System---HealthCare-System.git>
cd Database-Management-System---HealthCare-System
```

### 2. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE healthcare_db;
USE healthcare_db;
```

#### Create Database Tables
Run the following SQL commands in your MySQL client:

```sql
-- Users table for authentication
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role ENUM('Admin', 'Doctor', 'Patient') NOT NULL,
    patient_id INT NULL,
    doctor_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

-- Patients table
CREATE TABLE Patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_id) REFERENCES Insurance(insurance_id) ON DELETE SET NULL
);

-- Doctors table
CREATE TABLE Doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance table
CREATE TABLE Insurance (
    insurance_id INT PRIMARY KEY AUTO_INCREMENT,
    insurance_provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE Appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    reason_for_visit TEXT,
    status ENUM('Scheduled', 'Completed', 'Archived') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

-- Diagnoses table
CREATE TABLE Diagnoses (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    diagnosis_description TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id) ON DELETE CASCADE
);

-- Prescriptions table
CREATE TABLE Prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id) ON DELETE CASCADE
);
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=healthcare_db
JWT_SECRET=your_strong_jwt_secret_key
PORT=3001
```

#### Start Backend Server
```bash
npm start
# or
node server.js
```

The backend server will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend application will run on `http://localhost:3000`

## 🔧 Configuration

### Database Connection
Update the database connection settings in `backend/db_connection.js`:

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "your_mysql_password",
  database: "healthcare_db",
});
```

### JWT Secret
Update the JWT secret in `backend/routes/auth.js`:

```javascript
const JWT_SECRET = 'your_strong_and_unique_jwt_secret_key';
```

## 👥 User Roles & Access

### Admin Account
- **Setup**: Use the admin setup page at `/setup`
- **Permissions**: 
  - Create/edit/delete patients and doctors
  - View all appointments and medical records
  - Manage system-wide data

### Doctor Account
- **Registration**: Available at `/signup/doctor`
- **Permissions**:
  - View assigned appointments
  - Record diagnoses and prescriptions
  - Update appointment status

### Patient Account
- **Registration**: Available at `/signup/patient`
- **Permissions**:
  - Book appointments
  - View medical history
  - Update personal profile
  - View consultation feedback

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Patient/Doctor registration
- `POST /api/auth/register/admin` - Admin registration

### Patients
- `GET /api/patients` - Get all patients (Admin only)
- `GET /api/patients/me` - Get current patient profile
- `POST /api/patients` - Create patient (Admin only)
- `PUT /api/patients/:id` - Update patient (Admin only)
- `PUT /api/patients/me` - Update own profile
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/specializations` - Get specializations
- `POST /api/doctors` - Create doctor (Admin only)
- `PUT /api/doctors/:id` - Update doctor (Admin only)
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Appointments
- `GET /api/appointments` - Get appointments (Admin only)
- `GET /api/appointments/doctor` - Get doctor's appointments
- `GET /api/appointments/my-appointments` - Get patient's appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/status` - Update appointment status

### Medical Records
- `POST /api/diagnosis` - Create diagnosis
- `POST /api/prescriptions` - Create prescription
- `GET /api/diagnosis/appointment/:id` - Get appointment diagnosis
- `GET /api/prescriptions/appointment/:id` - Get appointment prescriptions

## 🎨 UI Features

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly navigation

### Theme Support
- Light and dark theme options
- Smooth theme transitions
- Persistent theme preferences

### User Experience
- Loading states and animations
- Real-time form validation
- Intuitive navigation
- Error handling and user feedback

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CORS configuration

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change port in `server.js` (backend)
   - Change port in `package.json` (frontend)

3. **CORS Issues**
   - Verify CORS configuration in `server.js`
   - Check API base URL in frontend

4. **Authentication Issues**
   - Verify JWT secret is consistent
   - Check token expiration
   - Clear localStorage if needed

### Development Tips

- Use browser developer tools for debugging
- Check server console for backend errors
- Verify API responses in Network tab
- Test with different user roles

## 📁 Project Structure
Database-Management-System---HealthCare-System/
├── backend/
│ ├── middleware/
│ │ └── authMiddleware.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── patients.js
│ │ ├── doctors.js
│ │ ├── appointments.js
│ │ ├── diagnosis.js
│ │ ├── prescriptions.js
│ │ └── insurance.js
│ ├── db_connection.js
│ ├── server.js
│ └── package.json
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── AdminDashboard.js
│ │ │ ├── DoctorDashboard.js
│ │ │ └── PatientDashboard.js
│ │ ├── login.js
│ │ ├── Signup.js
│ │ ├── RoleSelection.js
│ │ ├── AdminSetup.js
│ │ └── App.js
│ └── package.json
│
└── README.md
