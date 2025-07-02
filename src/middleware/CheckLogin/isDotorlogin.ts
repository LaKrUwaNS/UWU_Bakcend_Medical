import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import Doctor from "../../models/Doctor.model";
import { sendResponse } from "../../utils/response";
import { Session } from "../../models/session.model";
import { generateAccessToken } from "../../utils/WebToken";
import { sendTokenAsCookie } from "../../utils/Cookies";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const isDoctorLogin = TryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let accessToken = req.cookies.accessToken;

    if (!accessToken) {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, 400, false, "Email and password are required");
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return sendResponse(res, 404, false, "Doctor not found");
        }

        const isPasswordValid = await doctor.Doctorpasswordcompare(password);
        if (!isPasswordValid) {
            return sendResponse(res, 401, false, "Unauthorized: Invalid password");
        }

        const existingSession = await Session.findOne({ doctorId: doctor._id, sessionType: "LOGIN" });
        if (existingSession && existingSession.isActive()) {
            return sendResponse(res, 401, false, "Unauthorized: Active session already exists");
        }

        accessToken = generateAccessToken(doctor._id.toString());

        const newSession = new Session({
            date: new Date(),
            doctorId: doctor._id,
            accessToken,
            sessionType: "LOGIN",
            expireAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        await newSession.save();

        sendTokenAsCookie(res, accessToken);
        req.user = doctor._id;
        return next();
    }

    const session = await Session.findOne({ accessToken });
    if (!session) {
        return sendResponse(res, 401, false, "Unauthorized: Session not found");
    }

    if (session.sessionType !== "LOGIN") {
        return sendResponse(res, 401, false, "Unauthorized: Invalid session type");
    }

    if (!session.isActive()) {
        return sendResponse(res, 401, false, "Unauthorized: Session expired");
    }

    const userDate = await Doctor.findById(session.doctorId);
    if (!userDate) {
        return sendResponse(res, 404, false, "User not found");
    }

    req.user = userDate; // Attach full doctor data to req.user
    next(); // ✔️ Now safe to continue to controller
});