import Invoice from "../model/invoice_model.js";
import Patient from "../model/patient_model.js";
import Doctor from "../model/doctor_model.js";

export const createInvoice = async (req, res) => {
  try {
    if (req.user.role !== "receptionist") {
      return res.status(403).json({ msg: "Receptionist only" });
    }
    const { patientEmail, patientId, doctorId, items = [], subtotal, tax = 0, total, notes } = req.body;
    let patient;
    if (patientId) {
      patient = await Patient.findById(patientId);
    } else if (patientEmail) {
      patient = await Patient.findOne({ email: patientEmail });
    }
    if (!patient) return res.status(404).json({ msg: "Patient not found" });
    let doctor = null;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ msg: "Doctor not found" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "At least one item is required" });
    }
    if (typeof subtotal !== "number" || typeof total !== "number") {
      return res.status(400).json({ msg: "Subtotal and total are required numbers" });
    }
    const inv = await Invoice.create({
      patient: patient._id,
      doctor: doctor ? doctor._id : undefined,
      receptionist: req.user._id,
      items,
      subtotal,
      tax: tax || 0,
      total,
      status: "pending",
      notes,
    });
    res.status(201).json({ msg: "Invoice created", invoice: inv });
  } catch (error) {
    console.error("Create Invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    if (req.user.role !== "receptionist") {
      return res.status(403).json({ msg: "Receptionist only" });
    }
    const { id } = req.params;
    const { status } = req.body;
    // Backward compatible: accept "confirmed" and treat as "paid"
    const normalizedStatus = status === "confirmed" ? "paid" : status;
    if (!["pending", "paid"].includes(normalizedStatus)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    const inv = await Invoice.findByIdAndUpdate(id, { status: normalizedStatus }, { new: true });
    if (!inv) return res.status(404).json({ msg: "Invoice not found" });
    res.status(200).json({ msg: "Invoice updated", invoice: inv });
  } catch (error) {
    console.error("Update Invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listReceptionistInvoices = async (req, res) => {
  try {
    if (req.user.role !== "receptionist") {
      return res.status(403).json({ msg: "Receptionist only" });
    }
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const data = await Invoice.find(filter).populate("patient", "username email").populate("doctor", "username");
    res.status(200).json(data);
  } catch (error) {
    console.error("List Invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listPatientInvoices = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ msg: "Patients only" });
    }
    const data = await Invoice.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("List Patient Invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listDoctorInvoices = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ msg: "Doctors only" });
    }
    const data = await Invoice.find({ doctor: req.user._id }).populate("patient", "username email").sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("List Doctor Invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

