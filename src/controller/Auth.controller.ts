import { Request, Response } from "express";
import { doctorSchema } from "../utils/Schema";
import { TryCatch } from "../utils/Error/ErrorHandler";


// Doctor Register
export const RegisterDoctor = TryCatch(async (req: Request, res: Response) => {

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

        

    })