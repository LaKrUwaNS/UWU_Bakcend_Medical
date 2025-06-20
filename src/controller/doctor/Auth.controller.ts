// Doctor Auth Controller - Cleaned & Improved
import { Request, Response } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { SendMail } from "../../config/Nodemailer";
import { CreateOTP } from "../../utils/OTPGen";
import { sendTokenCookies } from "../../utils/Cookies";
import { generateAccessToken, generateRefreshToken } from "../../utils/WebToken";
import { FifteenMinutesFromNow, Now, TwoDaysFromNow } from "../../utils/Date";
import OTP from "../../models/OTP.model";
import Doctor from "../../models/Doctor.model";
import { Session } from "../../models/session.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



// Test Email
export const TestMail = TryCatch(async (req: Request, res: Response) => {
    const { Email } = req.body;

    if (!Email || typeof Email !== 'string') {
        return res.status(400).json({ message: "Valid email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    await SendMail(Email, "Test Email", "<h1>This is a test mail</h1>");
    return res.status(200).json({ message: "Mail has been sent successfully" });
});



// Register Doctor
export const RegisterDoctor = TryCatch(async (req: Request, res: Response) => {
    const { userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo } = req.body;

    if (!userName || !fullName || !password || !personalEmail || !professionalEmail || !securityCode) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmail) || !emailRegex.test(professionalEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingDoctor = await Doctor.findOne({
        $or: [
            { professionalEmail },
            { personalEmail },
            { userName }
        ]
    });

    if (existingDoctor) {
        return res.status(400).json({ message: "Doctor with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Doctor.create({
        userName,
        fullName,
        password: hashedPassword,
        personalEmail,
        professionalEmail,
        securityCode,
        title,
        photo
    });

    const otp = CreateOTP();
    await SendMail(professionalEmail, "OTP Verification", generateOtpEmailHtml(otp));

    await OTP.create({
        email: professionalEmail,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email"
    });

    return res.status(200).json({ message: "OTP sent successfully" });
});



// Verify Register OTP
export const VerifyRegisterOTP = TryCatch(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpData = await OTP.findOne({ email, Type: "Email" });
    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (String(otpData.OTP) !== String(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.Verified) return res.status(400).json({ message: "Doctor already verified" });

    doctor.Verified = true;
    await doctor.save();
    await OTP.deleteOne({ email, Type: "Email" });

    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    await Session.create({
        doctorId: doctor._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        expireAt: TwoDaysFromNow(),
        date: Now(),
        isAvailable: true
    });

    sendTokenCookies(res, accessToken, refreshToken);

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



// Doctor Login
export const DoctorLogging = TryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    if (req.cookies.accessToken) {
        return res.status(400).json({ message: "Already logged in" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(400).json({ message: "Invalid email or password" });

    if (!doctor.Verified) {
        return res.status(400).json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    await Session.updateMany({ doctorId: doctor._id, isAvailable: true }, { isAvailable: false });

    const accessToken = generateAccessToken(doctor._id.toString());
    const refreshToken = generateRefreshToken(doctor._id.toString());

    await Session.create({
        doctorId: doctor._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        expireAt: TwoDaysFromNow(),
        date: Now(),
        isAvailable: true
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



// Refresh Access Token
export const RefreshToken = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };
        const session = await Session.findOne({ refreshToken, isAvailable: true });

        if (!session || session.expireAt < new Date()) {
            return res.status(403).json({ message: "Invalid or expired session" });
        }

        const newAccessToken = generateAccessToken(session.doctorId!.toString());
        session.accessToken = newAccessToken;
        await session.save();

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({ message: "Access token refreshed successfully" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});



// Forgot Password
export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(200).json({ message: "If the email exists, OTP has been sent" });
    }

    const existingOtp = await OTP.findOne({ email, Type: "Reset" });
    if (existingOtp && existingOtp.OTPexpire > new Date()) {
        return res.status(400).json({ message: "OTP already sent. Please wait before requesting a new one." });
    }

    await OTP.deleteMany({ email, Type: "Reset" });

    const otp = CreateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await SendMail(email, "Password Reset OTP", generateResetOtpEmailHtml(otp));

    await OTP.create({
        email,
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset"
    });

    return res.status(200).json({ message: "If the email exists, OTP has been sent" });
});



// Reset Password
export const ResetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) return res.status(400).json({ message: "Invalid request" });

    const otpData = await OTP.findOne({ email, Type: "Reset" });
    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpData.OTP);
    if (!isOtpValid) return res.status(400).json({ message: "Invalid OTP" });

    doctor.password = await bcrypt.hash(password, 12);
    await doctor.save();

    await OTP.deleteOne({ email, Type: "Reset" });
    await Session.updateMany({ doctorId: doctor._id }, { isAvailable: false });

    return res.status(200).json({ message: "Password reset successfully" });
});




// Logout
export const Logout = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };
        await Session.findOneAndUpdate({ refreshToken }, { isAvailable: false });
    } catch (error) {
        console.error("Logout error:", error);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logged out successfully" });
});
