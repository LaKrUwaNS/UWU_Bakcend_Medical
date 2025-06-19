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
import Student from "../../models/Student.model";
import { Session } from "../../models/session.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ! Register Student
export const RegisterStudent = TryCatch(async (req: Request, res: Response) => {
    const {
        indexNumber,
        password,
        name,
        gender,
        contactNumber,
        emergencyNumber,
        bloodType,
        allergies,
        degree,
        presentYear,
        department,
        photo,
    } = req.body;

    // Validate required fields
    if (
        !indexNumber ||
        !password ||
        !name ||
        !gender ||
        !contactNumber ||
        !emergencyNumber ||
        !bloodType ||
        !degree ||
        !presentYear ||
        !department
    ) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check for existing student by indexNumber
    const existingStudent = await Student.findOne({ indexNumber });
    if (existingStudent) {
        return res.status(400).json({ message: "Student with this index number already exists" });
    }

    // Create student (password will be hashed via pre-save hook)
    const student = await Student.create({
        indexNumber,
        password,
        name,
        gender,
        contactNumber,
        emergencyNumber,
        bloodType,
        allergies,
        degree,
        presentYear,
        department,
        photo,
        isVerified: false,
    });

    // Generate OTP
    const otp = VerifyOTP();
    await SendMail(student.indexNumber + "@uwu.ac.lk", "OTP Verification", generateOtpEmailHtml(otp));

    // Hash OTP before saving
    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.create({
        email: student.indexNumber + "@uwu.ac.lk",
        OTP: hashedOtp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email",
    });

    res.status(200).json({ message: "OTP sent successfully" });
});

// ! Verify Register OTP
export const VerifyRegisterOTP = TryCatch(async (req: Request, res: Response) => {
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

    const student = await Student.findOne({ indexNumber: email.split("@")[0] });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    student.isVerified = true;
    await student.save();

    await OTP.deleteOne({ email, Type: "Email" });

    const accessToken = generateAccessToken(student._id as string);
    const refreshToken = generateRefreshToken(student._id as string);

    await Session.create({
        doctorId: student._id, // assuming session model is generic or change key to studentId if needed
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
        student: {
            id: student._id,
            name: student.name,
            indexNumber: student.indexNumber,
            verified: student.isVerified,
        },
    });
});

// ! Student Login
export const StudentLogin = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, password } = req.body;

    if (!indexNumber || !password) {
        return res.status(400).json({ message: "Index number and password are required" });
    }

    if (req.cookies.token) {
        return res.status(400).json({ message: "Already logged in" });
    }

    const student = await Student.findOne({ indexNumber });
    if (!student) {
        return res.status(400).json({ message: "Invalid index number or password" });
    }

    if (!student.isVerified) {
        return res.status(400).json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid index number or password" });
    }

    // Invalidate existing sessions
    await Session.updateMany(
        { doctorId: student._id, isAvailable: true }, // if you rename, use studentId
        { isAvailable: false }
    );

    const accessToken = generateAccessToken(student._id as string);
    const refreshToken = generateRefreshToken(student._id as string);

    await Session.create({
        doctorId: student._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        expireAt: TwoDaysFromNow(),
        date: Now(),
        isAvailable: true,
    });

    sendTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: "Student logged in successfully",
        student: {
            id: student._id,
            name: student.name,
            indexNumber: student.indexNumber,
            verified: student.isVerified,
        },
    });
});

// ! Forgot Password
export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const student = await Student.findOne({ indexNumber: email.split("@")[0] });
    if (!student) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ message: "If the email exists, OTP has been sent" });
    }

    // Check for existing reset OTP
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

// ! Reset Password
export const ResetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const student = await Student.findOne({ indexNumber: email.split("@")[0] });
    if (!student) {
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

    // Assign new password directly — pre-save hook will hash it
    student.password = password;
    await student.save();

    await OTP.deleteOne({ email, Type: "Reset" });

    // Invalidate all existing sessions for this student
    await Session.updateMany(
        { doctorId: student._id },
        { isAvailable: false }
    );

    res.status(200).json({ message: "Password reset successfully" });
});

// ! Refresh Access Token
export const RefreshToken = TryCatch(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };

        const session = await Session.findById(decoded.id).populate("doctorId");

        if (!session || !session.isAvailable || session.expireAt < new Date()) {
            return res.status(403).json({ message: "Invalid or expired session" });
        }

        if (!session.doctorId) {
            return res.status(403).json({ message: "Invalid session" });
        }

        const newAccessToken = generateAccessToken(session.doctorId.toString());
        session.accessToken = newAccessToken;
        await session.save();

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "Access token refreshed successfully" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});

// ! Logout
export const Logout = TryCatch(async (req: Request, res: Response) => {
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
