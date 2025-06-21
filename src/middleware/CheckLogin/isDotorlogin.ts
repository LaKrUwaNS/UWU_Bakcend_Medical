import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import Doctor from "../../models/Doctor.model";
import { ACCESS_TOKEN_SECRET } from "../../utils/dotenv";
import { sendResponse } from "../../utils/response";
import { Session } from "../../models/session.model";

// Extend Request to include `user`
export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const isDoctorLogin = TryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return sendResponse(res, 401, false, "Access token missing", null);
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;

        if (!decoded?.id) {
            return sendResponse(res, 401, false, "Invalid token payload", null);
        }

        // Find session and ensure doctor is linked
        const userSession = await Session.findOne({ accessToken: token });

        if (!userSession) {
            return sendResponse(res, 401, false, "Session not found or user not linked", null);
        }

        const doctor = await Doctor.findById(userSession.doctorId);

        if (!doctor) {
            return sendResponse(res, 401, false, "Doctor not found", null);
        }

        req.user = doctor;
        next();

    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            return sendResponse(res, 401, false, "Session expired. Please log in again.", null);
        }

        return sendResponse(res, 401, false, "Invalid token", null);
    }
});
