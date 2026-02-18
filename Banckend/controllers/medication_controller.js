import Medication from "../model/medication_model.js";
import Patient from "../model/patient_model.js";

export const addMedication = async (req, res) => {
    try {
        const { patientId, name, dosageAmount, dosageUnit, frequency, startDate, endDate, notes } = req.body;
        const doctorId = req.user._id;

        if (!patientId || !name || !dosageAmount || !dosageUnit || !frequency || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Allergy check (simple case-insensitive match)
        const hasAllergy = patient.allergies.some(allergy =>
            allergy.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(allergy.toLowerCase())
        );

        const newMedication = new Medication({
            patient: patientId,
            doctor: doctorId,
            name,
            dosageAmount,
            dosageUnit,
            frequency,
            startDate,
            endDate,
            notes,
            status: "active"
        });

        await newMedication.save();

        res.status(201).json({
            message: "Medication prescribed successfully",
            medication: newMedication,
            allergyWarning: hasAllergy ? `Warning: Patient is allergic to ${name} or a similar substance!` : null
        });
    } catch (error) {
        console.error("Error adding medication:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientMedications = async (req, res) => {
    try {
        const { patientId } = req.params;
        const medications = await Medication.find({ patient: patientId })
            .populate("doctor", "username specialization")
            .sort({ startDate: -1 });

        res.status(200).json(medications);
    } catch (error) {
        console.error("Error fetching medications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateMedicationStatus = async (req, res) => {
    try {
        const { medicationId } = req.params;
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const medication = await Medication.findByIdAndUpdate(
            medicationId,
            { status },
            { new: true }
        );

        if (!medication) {
            return res.status(404).json({ error: "Medication not found" });
        }

        res.status(200).json({ message: `Medication marked as ${status}`, medication });
    } catch (error) {
        console.error("Error updating medication status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMyMedications = async (req, res) => {
    try {
        const patientId = req.user._id;
        const medications = await Medication.find({ patient: patientId })
            .populate("doctor", "username specialization")
            .sort({ startDate: -1 });

        res.status(200).json(medications);
    } catch (error) {
        console.error("Error fetching my medications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
