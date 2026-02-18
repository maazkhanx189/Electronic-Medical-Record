import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  createInvoice,
  updateInvoiceStatus,
  listReceptionistInvoices,
  listPatientInvoices,
  listDoctorInvoices,
} from "../controllers/invoice_controller.js";

const router = express.Router();

// Receptionist endpoints
router.post("/", protect, createInvoice);
router.get("/", protect, listReceptionistInvoices);
router.put("/:id/status", protect, updateInvoiceStatus);

// Patient and Doctor views
router.get("/patient/my", protect, listPatientInvoices);
router.get("/doctor/my", protect, listDoctorInvoices);

export default router;

