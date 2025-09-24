# Healthcare Management System Project: Full-Stack Development Plan
## Project Goal

The primary objective of this project is to build a functional, full-stack web application that demonstrates key concepts in database design, secure backend development, and dynamic frontend user experiences. The application will simulate a basic healthcare management system with distinct user roles, showcasing a practical implementation of role-based access control.

## System Architecture

The application will be built on a secure three-tier architecture: a relational database for data persistence, a backend API for business logic, and a React frontend for the user interface.

  Frontend (React): The presentation layer, responsible for displaying the user interface. It will be a dynamic Single-Page Application (SPA) with different views based on the user's role.

  Backend (Node.js/Express.js): The application layer, which acts as the secure intermediary between the frontend and the database. It will handle all authentication, authorization, and data requests.

  Database (MySQL): The data layer, serving as the single source of truth for all healthcare data. It will be hosted on a local machine for development and will be structured to support the application's     functionality.

## Database Design

The database schema will be normalized to ensure data integrity and will include the following tables:

  Patients: Stores patient demographics and emergency contact information.

  Doctors: Contains doctor profiles and their specializations.

  Appointments: Tracks all patient-doctor appointments.
  
  Diagnoses: Records diagnoses associated with specific appointments.

  Prescriptions: Stores medication details for each diagnosis.

  Insurance: Holds information on insurance providers.

  Users: A critical table for authentication, storing user login credentials, a role (dba, doctor, or patient), and a foreign key to link to either a Patients or Doctors record.

## Role-Based Views and Functionality

  The application's front end will feature three distinct views, each with specific permissions:

### 1. DBA (Database Administrator) View

  This is the "boss" view with full administrative privileges. The DBA will be able to perform all CRUD (Create, Read, Update, Delete) operations on the database.

  Functionality:

  Create, view, edit, and delete Patients, Doctors, and Insurance records.

  Create, view, and manage all Appointments.

  Create and manage all Diagnoses and Prescriptions.

  Crucially, the DBA will also create user accounts for new patients and doctors, assigning them a temporary password and their respective role.

### 2. Doctor View

  A doctor's interface will focus on their scheduled patients and medical tasks.

  Functionality:

  View a personalized list of their scheduled and completed appointments.

  Access a patient's medical records for appointments they were involved in.

  Add new Diagnoses and Prescriptions to a patient's record after a completed visit.

  Update the status of an appointment to 'Completed'.

### 3. Patient View

  The patient view is the most restricted for security and privacy. A patient can only view their own records.

  Functionality:

  View their upcoming appointments.

  Access and read their personal Diagnoses and Prescriptions history.

  View their stored demographic and insurance information.


