import Visit from "../model/visit_model.js";
import Appointment from "../model/appointment_model.js";
import Patient from "../model/patient_model.js";
import Doctor from "../model/doctor_model.js";

// Create or update a visit for an appointment
const createOrUpdateVisit = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      chiefComplaint,
      diagnosis,
      treatment,
      prescriptions,
      vitalSigns,
      labResults,
      clinicalNotes,
      progressNotes,
      visitSummary,
      recommendations,
      followUpDate,
      visitTime,
      status
    } = req.body;

    const doctorId = req.user._id;

    // Check if appointment exists and belongs to the doctor
    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find existing visit or create new one
    let visit = await Visit.findOne({ appointment: appointmentId });

    if (visit) {
      // Update existing visit
      visit.chiefComplaint = chiefComplaint || visit.chiefComplaint;
      visit.diagnosis = diagnosis || visit.diagnosis;
      visit.treatment = treatment || visit.treatment;
      visit.prescriptions = prescriptions || visit.prescriptions;
      visit.vitalSigns = vitalSigns || visit.vitalSigns;
      visit.labResults = labResults || visit.labResults;
      visit.clinicalNotes = clinicalNotes || visit.clinicalNotes;
      visit.progressNotes = progressNotes || visit.progressNotes;
      visit.visitSummary = visitSummary || visit.visitSummary;
      visit.recommendations = recommendations || visit.recommendations;
      visit.followUpDate = followUpDate || visit.followUpDate;
      visit.visitTime = visitTime || visit.visitTime;
      visit.status = status || visit.status;
      visit.updatedAt = new Date();

      await visit.save();
      res.status(200).json({ message: "Visit updated successfully", visit });
    } else {
      // Create new visit
      const newVisit = new Visit({
        patient: appointment.patient._id,
        appointment: appointmentId,
        doctor: doctorId,
        chiefComplaint,
        diagnosis,
        treatment,
        prescriptions,
        vitalSigns,
        labResults,
        clinicalNotes,
        progressNotes,
        visitSummary,
        recommendations,
        followUpDate,
        visitTime,
        status: status || 'ongoing'
      });

      await newVisit.save();
      res.status(201).json({ message: "Visit created successfully", visit: newVisit });
    }
  } catch (error) {
    console.error("Error creating/updating visit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get visits for a patient
const getPatientVisits = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access
    if (req.user.role !== 'doctor' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const visits = await Visit.find({ patient: patientId })
      .populate('doctor', 'username specialization')
      .populate('appointment', 'date time reason')
      .sort({ date: -1 });

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific visit
const getVisit = async (req, res) => {
  try {
    const { visitId } = req.params;

    const visit = await Visit.findById(visitId)
      .populate('patient', 'username age gender')
      .populate('doctor', 'username specialization')
      .populate('appointment', 'date time reason')
      .populate('prescriptions.medication');

    if (!visit) {
      return res.status(404).json({ error: "Visit not found" });
    }

    // Check access
    if (req.user.role !== 'doctor' && req.user._id.toString() !== visit.patient._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(visit);
  } catch (error) {
    console.error("Error fetching visit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createOrUpdateVisit, getPatientVisits, getVisit };
