import { Request, Response } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { SendMail } from "../../config/Nodemailer";
import { VerifyOTP } from "../../utils/OTPGen";
import { sendTokenCookies } from "../../utils/Cookies";
import { generateAccessToken, generateRefreshToken } from "../../utils/WebToken";
import { FifteenMinutesFromNow, Now, TwoDaysFromNow } from "../../utils/Date";
import OTP from "../../models/OTP.model";
import Doctor from "../../models/Doctor.model";
import { Session } from "../../models/session.model";
import jwt from "jsonwebtoken";

// !Test Mail
export const TestMail = TryCatch(async (req: Request, res: Response) => {
    const { Email } = req.body;
    if (!Email) return res.status(400).json({ message: "Email is required" });

    await SendMail(Email, "Test Email", "<h1>This is a test mail</h1>");
    res.status(200).json({ message: "Mail has been sent successfully" });
});

// !Register Doctor
export const RegisterDoctor = TryCatch(async (req: Request, res: Response) => {
    const { userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo } = req.body;

    if (await Doctor.findOne({ professionalEmail })) {
        return res.status(400).json({ message: "Doctor already exists" });
    }

    await Doctor.create({ userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo });

    const otp = VerifyOTP();
    await SendMail(professionalEmail, "OTP Verification", generateOtpEmailHtml(otp));
    await OTP.create({ email: professionalEmail, OTP: otp, OTPexpire: FifteenMinutesFromNow(), Type: "Email" });

    res.status(200).json({ message: "OTP sent successfully" });
});

// !Verify Register OTP
export const VerifyRegisterOTP = TryCatch(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const otpData = await OTP.findOne({ email });

    if (!otpData || otpData.Type !== "Email" || otpData.OTP.trim() !== otp.trim() || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: !otpData ? "OTP not found for this email" : "Invalid or expired OTP" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.Verified = true;
    await doctor.save();
    await OTP.deleteOne({ email, Type: "Email" });

    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    await Session.create({ doctorId: doctor._id, accessToken, refreshToken, sessionType: "LOGIN", expireAt: TwoDaysFromNow(), date: Now() });
    sendTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
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
    if (req.cookies.token) return res.status(400).json({ message: "Already logged in" });

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor || !(await doctor.comparePass(password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    await Session.create({ doctorId: doctor._id, accessToken, refreshToken, sessionType: "LOGIN", expireAt: TwoDaysFromNow(), date: Now() });
    sendTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: "Doctor logged in successfully",
        doctor: {
            id: doctor._id,
            fullName: doctor.fullName,
            email: doctor.personalEmail,
            verified: doctor.Verified,
        },
    });
});

// !Refresh Access Token
export const RefreshToken = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const session = await Session.findOne({ refreshToken, isAvailable: true }).populate("doctorId");
    if (!session || session.expireAt < new Date()) return res.status(403).json({ message: "Session expired" });

    const newAccessToken = generateAccessToken(session._id as string);
    session.accessToken = newAccessToken;
    await session.save();

    res.cookie("token", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token refreshed" });
});

// !Forgot Password
export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(400).json({ message: "Doctor not found" });

    const otp = VerifyOTP();
    await SendMail(email, "OTP Verification", generateResetOtpEmailHtml(otp));
    await OTP.create({ email, OTP: otp, OTPexpire: FifteenMinutesFromNow(), Type: "Reset" });

    res.status(200).json({ message: "OTP sent successfully" });
});

// !Reset Password
export const ResetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;
    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(400).json({ message: "Doctor not found" });

    const otpData = await OTP.findOne({ email, Type: "Reset" });
    if (!otpData || otpData.OTP !== otp || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    doctor.password = password;
    await doctor.save();
    await OTP.deleteOne({ email, Type: "Reset" });

    res.status(200).json({ message: "Password reset successfully" });
});

// !Logout
export const Logout = TryCatch(async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await Session.findByIdAndUpdate(decoded.id, { isAvailable: false });

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
});
