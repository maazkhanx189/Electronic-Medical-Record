import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const doctorSchema = new mongoose.Schema({
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
    specialization: {
        type: String,
        required: true,
    },
    license: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        default: "doctor",
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    profilePicture: {
        type: String, // URL or local path
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


// ____________________________? 
// Password Hashing Middleware
// ____________________________?//
doctorSchema.pre('save', async function (next) {
    const doctor = this;
    if (!doctor.isModified("password")) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(doctor.password, salt);
        doctor.password = hash;
    } catch (error) {
        next(error);
    }
});

// ____________________________? 
// Password Comparison Method
// ____________________________?//
doctorSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// ____________________________? 
// JWT Generation Method
// ____________________________?//
doctorSchema.methods.generateToken = async function () {
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

export default mongoose.model("Doctor", doctorSchema);
