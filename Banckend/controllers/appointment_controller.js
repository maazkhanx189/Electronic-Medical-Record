import Appointment from "../model/appointment_model.js";
import Doctor from "../model/doctor_model.js";
import Patient from "../model/patient_model.js";

// Get appointments for a specific patient
const getPatientAppointments = async (req, res) => {
  try {
    const { patientID } = req.params;
    const appointments = await Appointment.find({ patient: patientID })
      .populate("doctor", "username specialization")
      .sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Get appointments for a specific doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorID } = req.params;
    const appointments = await Appointment.find({ doctor: doctorID })
      .populate("patient", "username email phone age gender address")
      .sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason, notes } = req.body;

    // Validate required fields
    if (!patient || !doctor || !date || !time || !reason) {
      return res.status(400).json({ msg: "All required fields must be provided" });
    }

    // Check if patient exists
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    // Validate date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date" });
    }
    // Compare only date parts, ignoring time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ msg: "Appointment date must be in the future" });
    }

    // Check if patient already has a pending or confirmed appointment with this doctor
    const existingAppointment = await Appointment.findOne({
      patient: patientDoc._id,
      doctor: doctor,
      status: { $in: ["pending", "confirmed"] }
    });
    if (existingAppointment) {
      return res.status(400).json({ msg: "You already have an appointment booked with this doctor." });
    }

    // Check if slot is already taken
    const slotTaken = await Appointment.findOne({
      doctor: doctor,
      date: appointmentDate,
      time: time,
      status: { $in: ["pending", "confirmed"] }
    });
    if (slotTaken) {
      return res.status(400).json({ msg: "time already booked" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientDoc._id,
      doctor,
      date: appointmentDate,
      time,
      reason,
      notes,
    });

    res.status(201).json({
      msg: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentID,
      { status },
      { new: true }
    ).populate("doctor", "username specialization");

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    res.status(200).json({
      msg: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Get booked slots for a doctor on a specific date
const getBookedSlots = async (req, res) => {
  try {
    const { doctorID, date } = req.query;
    if (!doctorID || !date) {
      return res.status(400).json({ msg: "Doctor ID and date are required" });
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const bookedAppointments = await Appointment.find({
      doctor: doctorID,
      date: appointmentDate,
      status: { $in: ["pending", "confirmed"] }
    }).select("time");

    const slots = bookedAppointments.map(app => app.time);
    res.status(200).json(slots);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Reschedule an appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const { date, time, reason, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({ msg: "Date and time are required" });
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ msg: "Appointment date must be in the future" });
    }

    // Check if slot is taken
    const oldAppointment = await Appointment.findById(appointmentID);
    if (!oldAppointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    const slotTaken = await Appointment.findOne({
      doctor: oldAppointment.doctor,
      date: appointmentDate,
      time: time,
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: appointmentID }
    });

    if (slotTaken) {
      return res.status(400).json({ msg: "time already booked" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentID,
      { date: appointmentDate, time, reason, notes, status: "pending" }, // Reset to pending on reschedule
      { new: true }
    );

    res.status(200).json({
      msg: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Get all appointments for receptionist (when patient books, receptionist can see it)
const getReceptionistAppointments = async (req, res) => {
  try {
    if (req.user.role !== "receptionist") {
      return res.status(403).json({ msg: "Receptionist only" });
    }
    const appointments = await Appointment.find({})
      .populate("patient", "username email phone")
      .populate("doctor", "username specialization")
      .sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching receptionist appointments:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { getPatientAppointments, getDoctorAppointments, createAppointment, updateAppointmentStatus, getBookedSlots, rescheduleAppointment, getReceptionistAppointments };
