import { z } from "zod";

export const doctorSchema = z.object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(3, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    medicalEmail: z.string().email("Invalid medical email"),
    medicalEmailVerified: z.boolean().optional(),
    universityEmail: z.string().email("Invalid university email"),
    securityCode: z.string().min(4, "Security code must be at least 4 characters"),
    title: z.string().min(2, "Title is required"),
    photo: z.string().url("Invalid photo URL").optional(),
});