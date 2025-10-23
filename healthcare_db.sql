CREATE DATABASE healthcare_db;

USE healthcare_db;

-- 1. Insurance Table 
CREATE TABLE Insurance (
    insurance_id INT PRIMARY KEY AUTO_INCREMENT,
    insurance_provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) NOT NULL
);

-- 2. Patients Table 
CREATE TABLE Patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20), 
    address VARCHAR(255),    
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_id INT,
    FOREIGN KEY (insurance_id) REFERENCES Insurance(insurance_id)
);

-- 3. Doctors Table 
CREATE TABLE Doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100), 
    phone_number VARCHAR(20)
);

-- 4. Users Table (The Login System)
-- This table stores credentials (email/hash) and links to the profile via ID and role.
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,       -- Used for login/username
    password_hash VARCHAR(255) NOT NULL,      -- Stores the secure password hash (e.g., bcrypt)
    user_role VARCHAR(20) NOT NULL,           -- 'Patient', 'Doctor', or 'Admin'
    patient_id INT,
    doctor_id INT,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    -- Constraint ensures a user is linked to only one profile type (or none if Admin)
    CONSTRAINT chk_role_link CHECK (
        (user_role = 'Admin' AND patient_id IS NULL AND doctor_id IS NULL) OR
        (user_role = 'Patient' AND patient_id IS NOT NULL AND doctor_id IS NULL) OR
        (user_role = 'Doctor' AND doctor_id IS NOT NULL AND patient_id IS NULL)
    )
);

-- 5. Appointments Table (Uses AUTO_INCREMENT)
CREATE TABLE Appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    appointment_date DATE,
    reason_for_visit VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Scheduled',
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

-- 6. Diagnoses Table (Uses AUTO_INCREMENT)
CREATE TABLE Diagnoses (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT,
    diagnosis_description TEXT,
    notes TEXT,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
);

-- 7. Prescriptions Table (Uses AUTO_INCREMENT)
CREATE TABLE Prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    instructions TEXT,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
);


INSERT INTO Insurance (insurance_provider, policy_number) VALUES
('Blue Cross Blue Shield', 'BCBS9012345'),
('Kaiser Permanente', 'KP7890123'),
('Blue Cross Blue Shield', 'BCBS9012367');

INSERT INTO Patients (first_name, last_name, date_of_birth, phone_number, address, emergency_contact_name, emergency_contact_phone, insurance_id) VALUES
('Sarah', 'Miller', '1995-03-15', '555-1001', '123 Oak St, Anytown', 'John Miller', '555-1002', 1),
('David', 'Chen', '1988-11-20', '555-2001', '45 Pine Ln, Otherville', 'Lisa Chen', '555-2002', 2),
('Evelyn', 'Reed', '1995-01-05', '555-1234', '9 Childcare St, Townsville', 'Markus Reed', '555-1235', 3);

INSERT INTO Doctors (first_name, last_name, specialization, phone_number) VALUES
('Dr. Emily', 'Carter', 'Pediatrics', '555-3001'),
('Dr. Ben', 'Harrison', 'Cardiology', '555-4001');

INSERT INTO Users (email, password_hash, user_role, patient_id, doctor_id) VALUES
('admin@hms.com', '$2a$10$R2h5s2X6J1h8G5L3z9p0Iu...', 'Admin', NULL, NULL),
('sarah.miller@mail.com', '$2a$10$R2h5s2X6J1h8G5L3z9p0Iu...', 'Patient', 1, NULL),
('e.carter@hms.com', '$2a$10$R2h5s2X6J1h8G5L3z9p0Iu...', 'Doctor', NULL, 1),
('evelyn.reed@mail.com', '$2a$10$X8a3T7R5J0k2S4y1w9u0Pb...', 'Patient', 22, NULL);

INSERT INTO Appointments (patient_id, doctor_id, appointment_date, reason_for_visit, status) VALUES
(1, 1, '2025-10-20', 'Annual checkup for child', 'Scheduled'),
(2, 2, '2025-10-21', 'Follow-up on blood pressure', 'Scheduled');

INSERT INTO Diagnoses (appointment_id, diagnosis_description, notes) VALUES
(1, 'Well Child Visit (WCV) completed. Patient is healthy.', 'Recommended annual flu shot.'),
(2, 'Hypertension (Primary). Patient is compliant with medication.', 'Adjust dosage if BP remains elevated.');

INSERT INTO Prescriptions (appointment_id, medication_name, dosage, instructions) VALUES
(2, 'Lisinopril', '10 mg', 'Take one tablet by mouth daily in the morning.'),
(2, 'Aspirin (Low Dose)', '81 mg', 'Take one tablet daily.');

