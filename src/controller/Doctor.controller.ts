import { Request, Response } from "express";
import { doctorSchema } from "../utils/Schema";


// Doctor Register
export const RegisterDoctor = async (req: Request, res: Response) => {
    try {
        const { userName, fullName, password, medicalEmail, universityEmail, securityCode, title, photo } = req.body;

        const validateData = doctorSchema.safeParse({
            userName,
            fullName,
            password,
            medicalEmail,
            universityEmail,
            securityCode,
            title,
            photo,
        });

        if (!validateData.success) {
            return res.status(400).json({
                success: false,
                message: validateData.error.message,
            });
        }

        // Mail Verification

        

    } catch (error) {
        console.error('Error occurred during doctor registration:', error);
        res.status(500).json({
            success: false,
        })
    }
}