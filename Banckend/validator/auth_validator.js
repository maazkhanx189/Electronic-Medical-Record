import { z } from "zod/v4";

// General user registration schema
export const User = z.object({
    username: z
        .string({ required_error: "username is Required." })
        .trim()
        .min(3, { message: "Name must be at least 3 character long." })
        .max(50, { message: "Name Cannot Be Longer Then 50 Characters." }),

    email: z
        .string({ required_error: "Email is Required." })
        .trim()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid Email Address" })
        .min(5, { message: "Email must be at least 5 character long." })
        .max(254, { message: "Email Cannot Be Longer Then 254 Characters." }),

    phone: z
        .string({ required_error: "Phone Number is Required." })
        .trim()
        .min(7, { message: "Phone must be at least 7 character long." })
        .max(20, { message: "Phone Cannot Be Longer Then 20 Characters." }),

    address: z
        .string({ required_error: "address is Required." })
        .trim()
        .min(3, { message: "address must be at least 3 character long." })
        .max(255, { message: "address Cannot Be Longer Then 255 Characters." }),

    password: z
        .string({ required_error: "Password is Required." })
        .min(6, { message: "Password must be at least 6 characters long." })
        .max(1000, { message: "Password Cannot Be Longer Then 1000 Characters." })
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, {
            message: "Password must contain at least one letter, one number, and one special character."
        }),
    gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
});

// Login schema
export const Login = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

// Patient registration schema
export const Patient = User.extend({
    age: z
        .union([z.string(), z.number()])
        .transform((v) => (typeof v === "string" && v.trim().length ? Number(v) : undefined))
        .refine((v) => v === undefined || (Number.isFinite(v) && v > 0), {
            message: "Age must be a positive number",
        }),
});

// Doctor registration schema
// Doctor registration schema
export const Doctor = User.extend({
    specialization: z.string().min(2, { message: "Specialization is required" }),
    license: z.string().min(2, { message: "License number is required" }),
    isApproved: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === "true").optional(),
    approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
});

// Receptionist registration schema
export const Receptionist = User.extend({});

export default User;
