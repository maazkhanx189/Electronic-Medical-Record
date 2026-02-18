import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    visitTime: {
        type: String,
    },
    chiefComplaint: {
        type: String,
    },
    diagnosis: {
        type: String,
    },
    treatment: {
        type: String,
    },
    prescriptions: [{
        medication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medication",
        },
        notes: String,
    }],
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
    },
    labResults: [{
        testName: String,
        result: String,
        date: Date,
        unit: String,
    }],
    clinicalNotes: {
        type: String,
    },
    progressNotes: {
        type: String,
    },
    visitSummary: {
        type: String,
    },
    recommendations: {
        type: String,
    },
    followUpDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["completed", "ongoing"],
        default: "completed",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model("Visit", visitSchema);
