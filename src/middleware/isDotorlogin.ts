import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.model";
import { TryCatch } from "../utils/Error/ErrorHandler";
import { Session } from "../models/session.model";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: "doctor";
    };
}

export const isDoctorLoggedIn = TryCatch(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Not logged in" });
        }

        // Verify Token
        const session = await Session.findOne({ accessToken: token });

        if (!session || session.expireAt < new Date()) {
            return res.status(401).json({ message: "Invalid or expired session" });
        }


        // Verify Doctor
        const doctor = await Doctor.findById(session.doctorId);

        if (!doctor) {
            return res.status(401).json({ message: "Doctor not found" });
        }

        req.user = {
            id: doctor._id.toString(),
            email: doctor.personalEmail,
            role: "doctor",
        };

        next();

    }
);
