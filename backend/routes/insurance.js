const express = require('express');
const router = express.Router();
const db = require('../db_connection');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- NEW PATIENT-SPECIFIC ROUTE ---

// POST /api/insurance/my-insurance (Create/Update a patient's own insurance)
router.post('/my-insurance', protect, async (req, res) => {
    const patient_id = req.user.profile_id;
    const { insurance_provider, policy_number } = req.body;

    if (req.user.role !== 'Patient') {
        return res.status(403).json({ error: 'Unauthorized: Only patients can update their insurance.' });
    }
    if (!insurance_provider || !policy_number) {
        return res.status(400).json({ error: 'Insurance provider and policy number are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Insert the new insurance details into the Insurance table
        const insertSql = 'INSERT INTO Insurance (insurance_provider, policy_number) VALUES (?, ?)';
        const [insertResult] = await connection.query(insertSql, [insurance_provider, policy_number]);
        const newInsuranceId = insertResult.insertId;

        // Step 2: Update the patient's record to link to this new insurance ID
        const updateSql = 'UPDATE Patients SET insurance_id = ? WHERE patient_id = ?';
        await connection.query(updateSql, [newInsuranceId, patient_id]);

        await connection.commit();
        res.json({ message: 'Insurance information saved successfully.' });

    } catch (error) {
        await connection.rollback();
        console.error('Failed to save patient insurance:', error);
        res.status(500).json({ error: 'Server error while saving insurance details.' });
    } finally {
        connection.release();
    }
});


// --- ADMIN-ONLY ROUTES (Remain secure for managing the master list) ---

// GET /api/insurance (Get All Insurance Providers - Admin Function)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Insurance');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve insurance data.' });
    }
});

// Other admin routes (POST, PUT, DELETE for master list) can remain as they were
// but are omitted here for brevity as they are not used by the patient dashboard.

module.exports = router;

