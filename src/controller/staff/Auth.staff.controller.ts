import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { TryCatch } from "../../utils/Error/ErrorHandler";
import { SendMail } from "../../config/Nodemailer";
import { VerifyOTP } from "../../utils/OTPGen";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { sendTokenCookies } from "../../utils/Cookies";
import { generateAccessToken, generateRefreshToken } from "../../utils/WebToken";
import { FifteenMinutesFromNow, Now, TwoDaysFromNow } from "../../utils/Date";

import OTP from "../../models/OTP.model";
import { Staff } from "../../models/Staff.model";
import { Session } from "../../models/session.model";

// --- Register Staff ---
export const RegisterStaff = TryCatch(async (req: Request, res: Response) => {
    const { name, title, email, jobTitle, mobileNumber, password, securityCode, photo } = req.body;

    if (!name || !title || !email || !jobTitle || !mobileNumber || !password || !securityCode) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check duplicates by email or mobileNumber
    const existingStaff = await Staff.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingStaff) {
        return res.status(400).json({ message: "Staff with this email or mobile number already exists" });
    }

    // Hash password & security code handled by pre-save hook

    const staff = await Staff.create({
        name,
        title,
        email,
        jobTitle,
        mobileNumber,
        password,
        securityCode,
        photo,
    });

    // Generate and send OTP to email
    const otp = VerifyOTP();
    await SendMail(email, "OTP Verification", generateOtpEmailHtml(otp));

    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.create({
        email,
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email",
    });

    res.status(200).json({ message: "OTP sent successfully" });
});

// --- Verify Registration OTP ---
export const VerifyRegisterOTPStaff = TryCatch(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpData = await OTP.findOne({ email, Type: "Email" });

    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), otpData.OTP);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
    }

    staff.isVerified = true;
    await staff.save();
    await OTP.deleteOne({ email, Type: "Email" });

    // Generate tokens & session (optional)
    const accessToken = generateAccessToken(staff._id as string);
    const refreshToken = generateRefreshToken(staff._id as string);

    await Session.create({
        staffId: staff._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        expireAt: TwoDaysFromNow(),
        date: Now(),
        isAvailable: true,
    });

    sendTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: "OTP verified successfully",
        staff: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            verified: staff.isVerified,
        },
    });
});

// --- Staff Login ---
export const StaffLogin = TryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    if (req.cookies.token) {
        return res.status(400).json({ message: "Already logged in" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!staff.isVerified) {
        return res.status(400).json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Invalidate existing sessions
    await Session.updateMany({ staffId: staff._id, isAvailable: true }, { isAvailable: false });

    const accessToken = generateAccessToken(staff._id as string);
    const refreshToken = generateRefreshToken(staff._id as string);

    await Session.create({
        staffId: staff._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        expireAt: TwoDaysFromNow(),
        date: Now(),
        isAvailable: true,
    });

    sendTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: "Staff logged in successfully",
        staff: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            verified: staff.isVerified,
        },
    });
});

// --- Forgot Password ---
export const ForgotPasswordStaff = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
        return res.status(200).json({ message: "If the email exists, OTP has been sent" });
    }

    const existingOtp = await OTP.findOne({ email, Type: "Reset" });
    if (existingOtp && existingOtp.OTPexpire > new Date()) {
        return res.status(400).json({ message: "OTP already sent. Please wait before requesting a new one." });
    }

    await OTP.deleteMany({ email, Type: "Reset" });

    const otp = VerifyOTP();
    await SendMail(email, "Password Reset OTP", generateResetOtpEmailHtml(otp));

    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.create({
        email,
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset",
    });

    res.status(200).json({ message: "If the email exists, OTP has been sent" });
});

// --- Reset Password ---
export const ResetPasswordStaff = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
        return res.status(400).json({ message: "Invalid request" });
    }

    const otpData = await OTP.findOne({ email, Type: "Reset" });
    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpData.OTP);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Assign new password directly to trigger pre-save hook for hashing
    staff.password = password;
    await staff.save();

    await OTP.deleteOne({ email, Type: "Reset" });

    // Invalidate all existing sessions
    await Session.updateMany({ staffId: staff._id }, { isAvailable: false });

    res.status(200).json({ message: "Password reset successfully" });
});

// --- Logout ---
export const LogoutStaff = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };
        await Session.findByIdAndUpdate(decoded.id, { isAvailable: false });
    } catch (error) {
        console.error("Error during logout:", error);
    }

    res.clearCookie("refreshToken");
    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
});
