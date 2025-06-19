import { Request, Response } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { SendMail } from "../../config/Nodemailer";
import { VerifyOTP } from "../../utils/OTPGen";
import OTP from "../../models/OTP.model";
import Doctor from "../../models/Doctor.model";
import { sendTokenCookies } from "../../utils/Cookies";
import { Session } from "../../models/session.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/WebToken";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { FifteenMinutesFromNow, Now } from "../../utils/Date";


// !TestMail
export const TestMail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { Email } = req.body;

        if (!Email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }

        await SendMail(Email, "Test Email", "<h1>This is a test mail</h1>");

        res.status(200).json({
            message: "Mail has been sent successfully"
        });
    } catch (error) {
        console.error("Error sending mail:", error);
        res.status(500).json({
            message: "Failed to send mail",
            error: (error as Error).message
        });
    }
};

// !Register Doctor
export const RegisterDoctor = TryCatch(async (req: Request, res: Response) => {
    const { userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo } = req.body;

    const existingDoctor = await Doctor.findOne({ professionalEmail });
    if (existingDoctor) {
        return res.status(400).json({ message: "Doctor already exists" });
    }

    await Doctor.create({
        userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo,
    });

    const otp = VerifyOTP();
    const html = generateOtpEmailHtml(otp);
    await SendMail(professionalEmail, "OTP Verification", html);

    await OTP.create({
        email: professionalEmail,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email",
    });

    return res.status(200).json({ message: "OTP sent successfully" });
});


// !Verify OTP
export const VerifyRegisterOTP = TryCatch(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    // Check for existing OTP record
    const otpData = await OTP.findOne({ email });
    if (!otpData) {
        return res.status(400).json({ message: "OTP not found for this email" });
    }

    // Validate OTP type, value, and expiry
    if (
        otpData.Type !== "Email" ||
        otpData.OTP.trim() !== otp.trim() ||
        otpData.OTPexpire < new Date() // Always compare in UTC
    ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find and update doctor
    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.Verified = true;
    await doctor.save();

    // Remove OTP entry after successful verification
    await OTP.deleteOne({ email, Type: "Email" });

    // Generate tokens
    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    // Create login session
    await Session.create({
        doctorId: doctor._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN", // Must match enum in Session model (e.g., "LOGIN", "RESET", etc.)
        date: Now(), // Sri Lankan time OK here
    });

    // Set tokens as cookies
    sendTokenCookies(res, accessToken, refreshToken);

    // Respond with success
    return res.status(200).json({
        message: "OTP verified successfully",
        doctor: {
            id: doctor._id,
            fullName: doctor.fullName,
            email: doctor.personalEmail,
            verified: doctor.Verified,
        },
    });
});



// !Doctor Login
export const DoctorLogging = TryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor || !(await doctor.comparePass(password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    // Create session with required fields
    await Session.create({
        doctorId: doctor._id,
        accessToken,
        refreshToken,
        sessionType: "login",
        date: Now(),
    });

    sendTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
        message: "Doctor logged in successfully",
        doctor: {
            id: doctor._id,
            fullName: doctor.fullName,
            email: doctor.personalEmail,
            verified: doctor.Verified,
        },
    });
});

// !Forgot Password
export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(400).json({ message: "Doctor not found" });
    }

    const otp = VerifyOTP();
    const html = generateResetOtpEmailHtml(otp);
    await SendMail(email, "OTP Verification", html);

    await OTP.create({
        email,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset",
    });

    return res.status(200).json({ message: "OTP sent successfully" });
});

// !Reset Password
export const ResetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(400).json({ message: "Doctor not found" });
    }

    const otpData = await OTP.findOne({ email, Type: "Reset" });
    if (!otpData || otpData.OTP !== otp || otpData.OTPexpire < FifteenMinutesFromNow()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    doctor.password = password;
    await doctor.save();
    await OTP.deleteOne({ email, Type: "Reset" });

    return res.status(200).json({ message: "Password reset successfully" });
});


//! Logout
export const Logout = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    await Session.deleteMany({ doctorId: doctor._id });

    return res.status(200).json({ message: "Doctor logged out successfully" });
});