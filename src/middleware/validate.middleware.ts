import { z } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const doctorZodSchema = z.object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    mobileNumber: z.string().min(10, "Mobile number is required"),
    personalEmail: z.string().email("Invalid personal email"),
    professionalEmail: z.string().email("Invalid professional email"),
    securityCode: z.string().min(4, "Security code is required"),
    title: z.string().min(1, "Title is required"),
    photo: z.string().url("Photo must be a valid URL").optional(),
});


export const otpVerificationSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(4, "OTP is required"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Middleware to validate and send simplified errors
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
