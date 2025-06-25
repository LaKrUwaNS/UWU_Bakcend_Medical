import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import Doctor from "../../models/Doctor.model";
import { sendResponse } from "../../utils/response";
import { Session } from "../../models/session.model";
import { generateAccessToken } from "../../utils/WebToken";
import { sendTokenAsCookie } from "../../utils/Cookies";

// Extend Request to include `user`
export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const isDoctorLogin = TryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let accessToken = req.cookies.accessToken;

    // 1. No token? Try login using email & password
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

        // Generate new access token
        accessToken = generateAccessToken(doctor._id.toString());

        // Create new session
        const newSession = new Session({
            date: new Date(),
            doctorId: doctor._id,
            accessToken,
            sessionType: "LOGIN",
            expireAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        await newSession.save();

        // Set cookie (optional)
        sendTokenAsCookie(res, accessToken);

        req.user = doctor._id;
        return next(); // Important to proceed
    }

    // 2. Access token exists in cookie: Validate session
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

    req.user = session.doctorId;
    next(); // Proceed to the next middleware/route
});
