import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const patientSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    role: {
        type: String,
        default: "patient",
    },
    medicalHistory: [{
        type: String,
    }],
    diagnoses: [{
        type: String,
    }],
    consultations: [{
        date: {
            type: Date,
            default: Date.now,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        notes: {
            type: String,
        },
        diagnosis: {
            type: String,
        },
    }],
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
    },
    labResults: {
        type: [{
            testName: String,
            sampleType: String,
            result: String,
            date: Date,
            unit: String,
            status: {
                type: String,
                enum: ["pending", "completed"],
                default: "completed"
            },
            doctor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Doctor"
            },
            doctorName: String,
            requestDate: {
                type: Date,
                default: Date.now
            },
            resultDate: Date,
            notes: String,
            attachment: String
        }],
        default: []
    },
    radiologyImages: [{
        type: String, // URL or path
    }],
    allergies: [{
        type: String,
    }],
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

patientSchema.pre('save', async function () {
    const patient = this;
    if (!patient.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(patient.password, salt);
    patient.password = hash;
});

patientSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

patientSchema.methods.generateToken = async function () {
    return jwt.sign(
        {
            userID: this._id.toString(),
            userEmail: this.email,
            role: this.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
    );
};

export default mongoose.model("Patient", patientSchema);
