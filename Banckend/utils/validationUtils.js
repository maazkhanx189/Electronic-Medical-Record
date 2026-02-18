import User from "../model/user_model.js";
import Patient from "../model/patient_model.js";
import Doctor from "../model/doctor_model.js";
import Receptionist from "../model/receptionist_model.js";

// Function to check if email or phone is already in use across all user types
export const checkUniqueEmailAndPhone = async (email, phone) => {
    // Check User model
    const userEmail = await User.findOne({ email });
    if (userEmail) {
        return { isUnique: false, message: "Email already exists in the system" };
    }

    const userPhone = await User.findOne({ phone });
    if (userPhone) {
        return { isUnique: false, message: "Phone number already exists in the system" };
    }

    // Check Patient model
    const patientEmail = await Patient.findOne({ email });
    if (patientEmail) {
        return { isUnique: false, message: "Email already exists in the system" };
    }

    const patientPhone = await Patient.findOne({ phone });
    if (patientPhone) {
        return { isUnique: false, message: "Phone number already exists in the system" };
    }

    // Check Doctor model
    const doctorEmail = await Doctor.findOne({ email });
    if (doctorEmail) {
        return { isUnique: false, message: "Email already exists in the system" };
    }

    const doctorPhone = await Doctor.findOne({ phone });
    if (doctorPhone) {
        return { isUnique: false, message: "Phone number already exists in the system" };
    }

    // Check Receptionist model
    const receptionistEmail = await Receptionist.findOne({ email });
    if (receptionistEmail) {
        return { isUnique: false, message: "Email already exists in the system" };
    }
    const receptionistPhone = await Receptionist.findOne({ phone });
    if (receptionistPhone) {
        return { isUnique: false, message: "Phone number already exists in the system" };
    }

    return { isUnique: true };
};
