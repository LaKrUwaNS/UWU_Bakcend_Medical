import { z } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

//! Doctor (Fixed: Removed `photo`)
export const RegisterDoctorZodSchema = z.object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    personalEmail: z.string().email("Invalid personal email"),
    professionalEmail: z.string().email("Invalid professional email"),
    securityCode: z.string().min(6, "Security code must be at least 6 characters"),
    title: z.string().min(2, "Title is required"),
});

// OTP verification
export const otpVerificationSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(4, "OTP is required"),
});

// Doctor login
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Forgot password
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// Reset password
export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(5, "OTP must be 5 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

//! Student
const genderEnum = z.enum(['male', 'female', 'other']);
const bloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const StudentregisterStudentSchema = z.object({
    indexNumber: z.string().min(1),
    password: z.string().min(6),
    name: z.string().min(1),
    gender: genderEnum,
    contactNumber: z.array(z.string().min(7)),
    emergencyNumber: z.string().min(7),
    bloodType: bloodTypeEnum,
    allergies: z.string().optional(),
    degree: z.string().min(1),
    presentYear: z.number().int().min(1).max(4),
});

export const StudentverifyStudentOtpSchema = z.object({
    indexNumber: z.string().min(1),
    otp: z.string().min(1),
});

export const StudentloginStudentSchema = z.object({
    indexNumber: z.string().min(1),
    password: z.string().min(6),
});

export const StudentforgotPasswordSchema = z.object({
    indexNumber: z.string().min(1),
});

export const StudentresetPasswordSchema = z.object({
    indexNumber: z.string().min(1),
    otp: z.string().min(1),
    newPassword: z.string().min(6),
});

export const StudentlogoutStudentSchema = z.object({
    indexNumber: z.string().min(1),
});



//!Middleware to validate and send simplified errors
export const validateMiddleware = (schema: z.ZodType): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Extract only unique, clear messages
                const uniqueMessages = Array.from(
                    new Set(error.errors.map(err => err.message))
                );

                res.status(400).json({
                    success: false,
                    errors: uniqueMessages,
                });
                return;
            }
            next(error);
        }
    };
};
