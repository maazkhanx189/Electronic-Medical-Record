import express from "express";
import { createOrUpdateVisit, getPatientVisits, getVisit } from "../controllers/visit_controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Create or update a visit for an appointment
router.post("/appointment/:appointmentId", protect, createOrUpdateVisit);

// Get visits for a patient
router.get("/patient/:patientId", protect, getPatientVisits);

// Get a specific visit
router.get("/:visitId", protect, getVisit);

export default router;
