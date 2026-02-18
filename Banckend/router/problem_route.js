import express from "express";
import { addProblem, getPatientProblems, resolveProblem, getMyProblems } from "../controllers/problem_controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Add a new problem/diagnosis
router.post("/", protect, addProblem);

// Get problems for a patient
router.get("/patient/:patientId", protect, getPatientProblems);

// Resolve a problem
router.put("/:problemId/resolve", protect, resolveProblem);

// Get my problems (for patients)
router.get("/my", protect, getMyProblems);

export default router;
