import Patient from "../model/patient_model.js";
import Visit from "../model/visit_model.js";
import Medication from "../model/medication_model.js";
import Problem from "../model/problem_model.js";
import Appointment from "../model/appointment_model.js";
import { checkUniqueEmailAndPhone } from "../utils/validationUtils.js";
import { Patient as PatientSchema } from "../validator/auth_validator.js";



// ____________________________? 
// Patient Registration
// ____________________________?//
const patientRegistration = async (req, res) => {
  try {
    // Validate input using Zod schema
    const validatedData = PatientSchema.parse(req.body);
    const { username, email, phone, address, password, age, gender } = validatedData;

    // Check if email and phone are unique across all user types
    const uniqueCheck = await checkUniqueEmailAndPhone(email, phone);
    if (!uniqueCheck.isUnique) {
      return res.status(400).json({ msg: uniqueCheck.message });
    }

    // Create new patient
    const patient = await Patient.create({
      username,
      email,
      phone,
      address,
      password,
      age,
      gender,
    });

    if (patient) {
      const token = await patient.generateToken();
      res.status(201).json({
        msg: "Patient registered successfully",
        patient,
        token,
        userID: patient._id.toString(),
        role: patient.role,
      });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    console.error("Patient Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





// ____________________________? 
// Patient Login
// ____________________________?//
const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", { email, role: "patient" });

    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
      console.log("Login failed: Patient not found", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isPasswordMatch = await patient.comparePassword(password);
    if (!isPasswordMatch) {
      console.log("Login failed: Password mismatch for", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = await patient.generateToken();

    res.status(200).json({
      msg: "Login successful",
      token,
      userID: patient._id.toString(),
      role: patient.role,
      patient: {
        username: patient.username,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error("Patient Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current patient profile
const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId)
      .populate('consultations.doctor', 'username specialization profilePicture')
      .select("-password");

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get patient medical history
const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user is doctor or the patient themselves
    if (req.user.role !== 'doctor' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch patient basic info
    const patient = await Patient.findById(patientId)
      .select("username age gender allergies medicalHistory createdAt");

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Fetch visits with populated data
    const visits = await Visit.find({ patient: patientId })
      .populate('doctor', 'username specialization')
      .populate('appointment', 'date time reason')
      .populate('prescriptions.medication')
      .sort({ date: -1 });

    // Fetch medications
    const medications = await Medication.find({ patient: patientId })
      .populate('doctor', 'username specialization')
      .sort({ startDate: -1 });

    // Fetch problems/diagnoses
    const problems = await Problem.find({ patient: patientId })
      .populate('doctor', 'username specialization')
      .sort({ createdAt: -1 });

    // Fetch appointments for visit count
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'username specialization')
      .sort({ date: -1 });

    // Calculate visit count
    const visitCount = appointments.filter(apt => apt.status === 'completed').length;
    const lastVisitDate = appointments.length > 0 ? appointments[0].date : null;

    const history = {
      patient: {
        id: patient._id,
        name: patient.username,
        age: patient.age,
        gender: patient.gender,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        createdAt: patient.createdAt,
      },
      summary: {
        totalVisits: visitCount,
        lastVisitDate: lastVisitDate,
      },
      visits: visits,
      medications: medications,
      problems: problems,
      appointments: appointments,
    };

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching patient history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { patientRegistration, patientLogin, getPatientProfile, getPatientHistory };
