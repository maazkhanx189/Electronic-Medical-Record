import Doctor from "../model/doctor_model.js";
import Patient from "../model/patient_model.js";
import Appointment from "../model/appointment_model.js";
import { checkUniqueEmailAndPhone } from "../utils/validationUtils.js";
import { Doctor as DoctorSchema } from "../validator/auth_validator.js";




// ____________________________?
// Doctor Registration
// ____________________________?//
const doctorRegistration = async (req, res) => {
  try {
    // Validate input using Zod schema
    const validatedData = DoctorSchema.parse(req.body);
    const { username, email, phone, address, password, specialization, license, isApproved, approvalStatus, gender } = validatedData;

    // Check if email and phone are unique across all user types
    const uniqueCheck = await checkUniqueEmailAndPhone(email, phone);
    if (!uniqueCheck.isUnique) {
      return res.status(400).json({ error: uniqueCheck.message });
    }

    // Check if license is unique (doctor-specific)
    const doctorExists = await Doctor.findOne({ license });
    if (doctorExists) {
      return res.status(400).json({ error: "Doctor with this license already exists" });
    }

    // Determine approval status based on user role or provided values
    const isAdmin = req.user && req.user.role === "admin";
    const finalIsApproved = isApproved !== undefined ? isApproved : (isAdmin ? true : false);
    const finalApprovalStatus = approvalStatus !== undefined ? approvalStatus : (isAdmin ? "approved" : "pending");

    // Handle profile picture
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    // Create new doctor
    const doctor = await Doctor.create({
      username,
      email,
      phone,
      address,
      password,
      specialization,
      license,
      isApproved: finalIsApproved,
      approvalStatus: finalApprovalStatus,
      gender,
      profilePicture,
    });

    if (doctor) {
      const message = isAdmin
        ? "Doctor added successfully by admin."
        : "Doctor registered successfully. Your account is pending admin approval.";

      res.status(201).json({
        msg: message,
        doctor: {
          username: doctor.username,
          email: doctor.email,
          specialization: doctor.specialization,
        },
        isApproved: doctor.isApproved,
        approvalStatus: doctor.approvalStatus,
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
    console.error("Doctor Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





// ____________________________? 
// Doctor Login
// ____________________________?//
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isPasswordMatch = await doctor.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Check if doctor is approved
    if (!doctor.isApproved) {
      return res.status(403).json({ msg: "Your account is pending admin approval. Please check your email for updates." });
    }

    const token = await doctor.generateToken();

    res.status(200).json({
      msg: "Login successful",
      token,
      userID: doctor._id.toString(),
      role: doctor.role,
      doctor: {
        username: doctor.username,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all approved doctors
const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true }).select("username specialization _id profilePicture gender");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching approved doctors:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Add a new consultation for a patient
const addConsultation = async (req, res) => {
  try {
    const { patientId, notes, diagnosis } = req.body;
    const doctorId = req.user._id;

    if (!patientId || !notes || !diagnosis) {
      return res.status(400).json({ error: "Patient ID, notes, and diagnosis are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const newConsultation = {
      date: new Date(),
      doctor: doctorId,
      notes,
      diagnosis,
    };

    if (!Array.isArray(patient.consultations)) {
      patient.consultations = [];
    }
    patient.consultations.push(newConsultation);
    await patient.save();

    res.status(201).json({ msg: "Consultation added successfully", consultation: newConsultation });
  } catch (error) {
    console.error("Error adding consultation:", error);
    res.status(500).json({ error: "Internal server error", details: String(error?.message || error) });
  }
};

// Update an existing consultation
const updateConsultation = async (req, res) => {
  try {
    const { patientId, consultationId, notes, diagnosis } = req.body;
    const doctorId = req.user._id;

    if (!patientId || !consultationId || !notes || !diagnosis) {
      return res.status(400).json({ error: "Patient ID, consultation ID, notes, and diagnosis are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find the consultation subdocument
    const consultation = patient.consultations.id(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Optional: Check if the requesting doctor is the one who created the consultation
    // if (consultation.doctor.toString() !== doctorId) {
    //   return res.status(403).json({ error: "Not authorized to update this consultation" });
    // }

    consultation.notes = notes;
    consultation.diagnosis = diagnosis;

    // Mark the subdocument field as modified effectively if needed, though direct assignment usually works
    // patient.markModified('consultations'); 

    await patient.save();

    res.status(200).json({ msg: "Consultation updated successfully", consultation });
  } catch (error) {
    console.error("Error updating consultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update medical history for a patient
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId, medicalHistory } = req.body;

    if (!patientId || !Array.isArray(medicalHistory)) {
      return res.status(400).json({ error: "Patient ID and medical history array are required" });
    }

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $set: { medicalHistory: medicalHistory } },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ msg: "Medical history updated successfully" });
  } catch (error) {
    console.error("Error updating medical history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update diagnoses for a patient
const updateDiagnoses = async (req, res) => {
  try {
    const { patientId, diagnoses } = req.body;

    if (!patientId || !Array.isArray(diagnoses)) {
      return res.status(400).json({ error: "Patient ID and diagnoses array are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    patient.diagnoses = diagnoses;
    await patient.save();

    res.status(200).json({ msg: "Diagnoses updated successfully" });
  } catch (error) {
    console.error("Error updating diagnoses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get patient details
const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate('consultations.doctor', 'username specialization');
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({
      patient: {
        _id: patient._id,
        username: patient.username,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        age: patient.age,
        gender: patient.gender,
        medicalHistory: patient.medicalHistory,
        diagnoses: patient.diagnoses,
        consultations: patient.consultations,
        vitalSigns: patient.vitalSigns,
        labResults: patient.labResults,
        radiologyImages: patient.radiologyImages,
        allergies: patient.allergies,
        medications: patient.medications,
      }
    });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update lab results for a patient
const updateLabResults = async (req, res) => {
  try {
    const { patientId, labResults } = req.body;

    if (!patientId || !Array.isArray(labResults)) {
      return res.status(400).json({ error: "Patient ID and lab results array are required" });
    }

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $set: { labResults: labResults } },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ msg: "Lab results updated successfully" });
  } catch (error) {
    console.error("Error updating lab results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update medications for a patient
const updateMedications = async (req, res) => {
  try {
    const { patientId, medications } = req.body;

    if (!patientId || !Array.isArray(medications)) {
      return res.status(400).json({ error: "Patient ID and medications array are required" });
    }

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $set: { medications: medications } },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ msg: "Medications updated successfully" });
  } catch (error) {
    console.error("Error updating medications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    // Find appointments for this doctor that are confirmed or completed
    const appointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ["confirmed", "completed"] }
    }).distinct('patient');

    // Fetch patient details for these IDs
    const patients = await Patient.find({
      _id: { $in: appointments }
    }).select("-password");

    res.status(200).json({ data: patients });
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePatientUsername = async (req, res) => {
  try {
    const { patientId, username } = req.body;

    if (!patientId || !username) {
      return res.status(400).json({ error: "Patient ID and username are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    patient.username = username;
    await patient.save();

    res.status(200).json({ msg: "Patient username updated successfully", username: patient.username });
  } catch (error) {
    console.error("Error updating patient username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePatientDetails = async (req, res) => {
  try {
    const { patientId, username, age, gender, phone, address } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    if (username !== undefined) patient.username = username;
    if (age !== undefined) patient.age = Number(age);
    if (gender !== undefined) patient.gender = gender;
    if (phone !== undefined) patient.phone = phone;
    if (address !== undefined) patient.address = address;

    await patient.save();

    res.status(200).json({ msg: "Patient details updated successfully", patient });
  } catch (error) {
    console.error("Error updating patient details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select("-password");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { username, specialization, phone, address } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (username) doctor.username = username;
    if (specialization) doctor.specialization = specialization;
    if (phone) doctor.phone = phone;
    if (address) doctor.address = address;

    await doctor.save();

    res.status(200).json({
      msg: "Profile updated successfully",
      doctor: {
        username: doctor.username,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        address: doctor.address
      }
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  doctorRegistration,
  doctorLogin,
  getApprovedDoctors,
  addConsultation,
  updateConsultation,
  updateMedicalHistory,
  updateDiagnoses,
  updateLabResults,
  updateMedications,
  getPatientDetails,
  getDoctorPatients,
  updatePatientUsername,
  updatePatientDetails,
  updateDoctorProfile,
  getDoctorProfile
};

