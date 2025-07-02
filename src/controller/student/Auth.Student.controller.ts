import { Request, Response } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import { SendMail } from "../../config/Nodemailer";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { generateWelcomeEmailHtml } from "../../const/Mail/Welcome.templete";

import { CreateOTP } from "../../utils/OTPGen";
import { sendTokenAsCookie } from "../../utils/Cookies";
import { generateAccessToken } from "../../utils/WebToken";
import { FifteenMinutesFromNow, OneDayFromNow } from "../../utils/Date";
import { sendResponse } from "../../utils/response";

import Student from "../../models/Student.model";
import OTP from "../../models/OTP.model";
import { Session } from "../../models/session.model";

// ✅ Register Student & Send OTP
export const RegisterStudent = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, password, name, gender, contactNumber, emergencyNumber, bloodType, allergies, degree, presentYear } = req.body;

    if (!indexNumber || !password || !name || !gender || !contactNumber || !emergencyNumber || !bloodType || !degree || !presentYear) {
        return sendResponse(res, 400, false, "All fields are required");
    }

    const existing = await Student.findOne({ indexNumber });
    if (existing) return sendResponse(res, 400, false, "Student already exists");

    const newStudent = new Student({
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
        expireAt: OneDayFromNow(),
    });

    await newStudent.save();

    const otp = CreateOTP();
    await OTP.create({
        email: indexNumber, // Using indexNumber as email placeholder
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email",
    });

    await SendMail(indexNumber, "OTP Verification", generateOtpEmailHtml(otp));
    return sendResponse(res, 201, true, "Student registered successfully, OTP sent");
});

// ✅ Verify OTP
export const VerifyStudentOTP = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, otp } = req.body;

    const otpRecord = await OTP.findOne({ email: indexNumber, Type: "Email" });
    if (!otpRecord) return sendResponse(res, 400, false, "Invalid or expired OTP");

    const isOtpValid = await otpRecord.compareOtp(otp);
    const isOtpExpired = otpRecord.OTPexpire < new Date();
    if (!isOtpValid || isOtpExpired) return sendResponse(res, 400, false, "Invalid or expired OTP");

    const student = await Student.findOne({ indexNumber });
    if (!student) return sendResponse(res, 404, false, "Student not found");

    student.isVerified = true;
    student.expireAt = null;
    await student.save();
    await otpRecord.deleteOne();

    const accessToken = generateAccessToken(student._id  as string);
    sendTokenAsCookie(res, accessToken);
    await Session.create({
        studentId: student._id,
        accessToken,
        sessionType: "LOGIN",
        expireAt: OneDayFromNow(),
        date: new Date(),
    });

    await SendMail(indexNumber, "Welcome to Our Platform", generateWelcomeEmailHtml(student.name));
    return sendResponse(res, 200, true, "OTP verified successfully");
});

// ✅ Login Student
export const LoginStudent = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, password } = req.body;

    const token = req.cookies.accessToken;
    if (token) {
        const session = await Session.findOne({ accessToken: token });
        if (session) return sendResponse(res, 400, false, "Already logged in");
    }

    const student = await Student.findOne({ indexNumber });
    if (!student) return sendResponse(res, 404, false, "No student found");

    const isPasswordCorrect = await student.comparePass(password);
    if (!isPasswordCorrect) return sendResponse(res, 400, false, "Invalid credentials");

    const accessToken = generateAccessToken(student._id as string);
    sendTokenAsCookie(res, accessToken);
    await Session.create({
        studentId: student._id,
        accessToken,
        sessionType: "LOGIN",
        expireAt: OneDayFromNow(),
        date: new Date(),
    });

    return sendResponse(res, 200, true, "Login successful");
});

// ✅ Logout Student
export const LogoutStudent = TryCatch(async (req: Request, res: Response) => {
    const token = req.cookies.accessToken;
    if (!token) return sendResponse(res, 400, false, "No token found");

    const session = await Session.findOne({ accessToken: token });
    if (!session) return sendResponse(res, 404, false, "No session found");

    await session.deleteOne();
    res.clearCookie("accessToken");

    return sendResponse(res, 200, true, "Logout successful");
});

// ✅ Forgot Password
export const ForgotStudentPassword = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber } = req.body;

    const student = await Student.findOne({ indexNumber });
    if (!student) return sendResponse(res, 404, false, "Student not found");

    const otp = CreateOTP();
    await SendMail(indexNumber, "Password Reset OTP", generateResetOtpEmailHtml(otp));
    await OTP.create({
        email: indexNumber,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset",
    });

    return sendResponse(res, 200, true, "OTP sent for password reset");
});

// ✅ Reset Password
export const ResetStudentPassword = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, otp, password } = req.body;

    const otpRecord = await OTP.findOne({ email: indexNumber, Type: "Reset" });
    if (!otpRecord) return sendResponse(res, 400, false, "Invalid or expired OTP");

    const isOtpValid = await otpRecord.compareOtp(otp);
    const isOtpExpired = otpRecord.OTPexpire < new Date();
    if (!isOtpValid || isOtpExpired) return sendResponse(res, 400, false, "Invalid or expired OTP");

    const student = await Student.findOne({ indexNumber });
    if (!student) return sendResponse(res, 404, false, "Student not found");

    student.password = password;
    await student.save();
    await otpRecord.deleteOne();

    return sendResponse(res, 200, true, "Password reset successfully");
});

// ✅ Update Student Profile
