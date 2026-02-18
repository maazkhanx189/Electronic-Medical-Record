import express from 'express';
import { addConsultation, updateConsultation, updateMedicalHistory, updateDiagnoses, getPatientDetails, updateLabResults, updateMedications, getDoctorPatients, updatePatientUsername, updatePatientDetails, getApprovedDoctors, updateDoctorProfile, getDoctorProfile } from '../controllers/doctor_controller.js';
import { addProblem, getPatientProblems, resolveProblem } from '../controllers/problem_controller.js';
import { addMedication, getPatientMedications, updateMedicationStatus } from '../controllers/medication_controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes for doctors
router.post('/add-consultation', protect, addConsultation);
router.put('/update-consultation', protect, updateConsultation);
router.put('/update-medical-history', protect, updateMedicalHistory);
router.put('/update-diagnoses', protect, updateDiagnoses);
router.get('/patient/:patientId', protect, getPatientDetails);
router.put('/update-lab-results', protect, updateLabResults);
router.put('/update-medications', protect, updateMedications);
router.get('/my-patients', protect, getDoctorPatients);
router.put('/update-patient-username', protect, updatePatientUsername);
router.get('/approved', protect, getApprovedDoctors);
router.put('/update-patient-details', protect, updatePatientDetails);
router.put('/update-profile', protect, updateDoctorProfile);
router.get('/profile/:doctorId', protect, getDoctorProfile);

// Problem List Routes
router.post('/problems', protect, addProblem);
router.get('/problems/:patientId', protect, getPatientProblems);
router.put('/problems/:problemId/resolve', protect, resolveProblem);

// Medication Routes
router.post('/medications', protect, addMedication);
router.get('/medications/:patientId', protect, getPatientMedications);
router.put('/medications/:medicationId/status', protect, updateMedicationStatus);

export default router;
