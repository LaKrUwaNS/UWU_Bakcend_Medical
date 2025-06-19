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
import bcrypt from "bcrypt";

// !Test Mail
export const TestMail = TryCatch(async (req: Request, res: Response) => {
    const { Email } = req.body;

    // Input validation
    if (!Email || typeof Email !== 'string') {
        return res.status(400).json({ message: "Valid email is required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    await SendMail(Email, "Test Email", "<h1>This is a test mail</h1>");
    res.status(200).json({ message: "Mail has been sent successfully" });
});

// !Register Doctor
export const RegisterDoctor = TryCatch(async (req: Request, res: Response) => {
    const { userName, fullName, password, personalEmail, professionalEmail, securityCode, title, photo } = req.body;

    // Input validation
    if (!userName || !fullName || !password || !personalEmail || !professionalEmail || !securityCode) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmail) || !emailRegex.test(professionalEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if doctor already exists with either email
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

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

    const otp = VerifyOTP();
    await SendMail(professionalEmail, "OTP Verification", generateOtpEmailHtml(otp));

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.create({
        email: professionalEmail,
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email"
    });

    res.status(200).json({ message: "OTP sent successfully" });
});

// !Verify Register OTP
export const VerifyRegisterOTP = TryCatch(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpData = await OTP.findOne({ email, Type: "Email" });

    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Verify OTP using bcrypt
    const isOtpValid = await bcrypt.compare(otp.trim(), otpData.OTP);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

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

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if already logged in
    if (req.cookies.token) {
        return res.status(400).json({ message: "Already logged in" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if doctor is verified
    if (!doctor.Verified) {
        return res.status(400).json({ message: "Please verify your email first" });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Invalidate any existing sessions for this doctor
    await Session.updateMany(
        { doctorId: doctor._id, isAvailable: true },
        { isAvailable: false }
    );

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

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };

        const session = await Session.findById(decoded.id).populate("doctorId");

        if (!session || !session.isAvailable || session.expireAt < new Date()) {
            return res.status(403).json({ message: "Invalid or expired session" });
        }

        if (!session.doctorId) {
            return res.status(403).json({ message: "Invalid session" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(session.doctorId.toString());
        session.accessToken = newAccessToken;
        await session.save();

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(200).json({ message: "Access token refreshed successfully" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});

// !Forgot Password
export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Input validation
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ message: "If the email exists, OTP has been sent" });
    }

    // Check for existing reset OTP
    const existingOtp = await OTP.findOne({ email, Type: "Reset" });
    if (existingOtp && existingOtp.OTPexpire > new Date()) {
        return res.status(400).json({ message: "OTP already sent. Please wait before requesting a new one." });
    }

    // Delete any existing reset OTP
    await OTP.deleteMany({ email, Type: "Reset" });

    const otp = VerifyOTP();
    await SendMail(email, "Password Reset OTP", generateResetOtpEmailHtml(otp));

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.create({
        email,
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset"
    });

    res.status(200).json({ message: "If the email exists, OTP has been sent" });
});


// !Reset Password
export const ResetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    // Input validation
    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    // Password strength validation
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const doctor = await Doctor.findOne({ professionalEmail: email });
    if (!doctor) {
        return res.status(400).json({ message: "Invalid request" });
    }

    const otpData = await OTP.findOne({ email, Type: "Reset" });
    if (!otpData || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Verify OTP using bcrypt
    const isOtpValid = await bcrypt.compare(otp, otpData.OTP);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Assign new password directly — pre-save hook will hash it
    doctor.password = password;
    await doctor.save();

    await OTP.deleteOne({ email, Type: "Reset" });

    // Invalidate all existing sessions for this doctor
    await Session.updateMany(
        { doctorId: doctor._id },
        { isAvailable: false }
    );

    res.status(200).json({ message: "Password reset successfully" });
});



// !Logout
export const Logout = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };
        await Session.findByIdAndUpdate(decoded.id, { isAvailable: false });
    } catch (error) {
        // Token might be invalid, but we still want to clear cookies
        console.error("Error during logout:", error);
    }

    // Clear both cookies
    res.clearCookie("refreshToken");
    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
});