import express from "express";
import {
    getPatientAppointments,
    getDoctorAppointments,
    createAppointment,
    updateAppointmentStatus,
    getBookedSlots,
    rescheduleAppointment,
    getReceptionistAppointments
} from "../controllers/appointment_controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Get appointments for a specific patient
router.get("/patient/:patientID", protect, getPatientAppointments);

// Get appointments for a specific doctor
router.get("/doctor/:doctorID", protect, getDoctorAppointments);

// Get all appointments for receptionist
router.get("/receptionist", protect, getReceptionistAppointments);

// Get booked slots for a doctor on a specific date
router.get("/booked-slots", protect, getBookedSlots);

// Create a new appointment
router.post("/", protect, createAppointment);

// Update appointment status
router.put("/:appointmentID/status", protect, updateAppointmentStatus);

// Reschedule appointment
router.put("/:appointmentID/reschedule", protect, rescheduleAppointment);

export default router;
