import express from 'express';
import { addMedication, getPatientMedications, updateMedicationStatus } from '../controllers/medication_controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Add a new medication (protected route for doctors)
router.post('/add', protect, addMedication);

// Get medications for a specific patient (protected route)
router.get('/patient/:patientId', protect, getPatientMedications);

// Update medication status (protected route)
router.put('/:medicationId/status', protect, updateMedicationStatus);

export default router;
