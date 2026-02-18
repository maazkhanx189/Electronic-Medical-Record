import express from 'express';
import { getPatientProfile, getPatientHistory } from '../controllers/patient_controller.js';
import { getMyProblems } from '../controllers/problem_controller.js';
import { getMyMedications } from '../controllers/medication_controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes for patients
router.get('/profile', protect, getPatientProfile);
router.get('/problems', protect, getMyProblems);
router.get('/medications', protect, getMyMedications);
router.get('/history/:patientId', protect, getPatientHistory);

export default router;
