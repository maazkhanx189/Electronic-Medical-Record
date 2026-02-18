import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        dosageAmount: {
            type: String,
            required: true,
        },
        dosageUnit: {
            type: String,
            required: true,
        },
        frequency: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);
export default Medication;
