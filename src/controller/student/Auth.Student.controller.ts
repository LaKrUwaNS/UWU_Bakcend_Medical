import { Request, Response } from "express";
import { TryCatch } from "../../utils/Error/ErrorHandler";
import { generateOtpEmailHtml } from "../../const/Mail/OTP.templete";
import { SendMail } from "../../config/Nodemailer";
import { VerifyOTP } from "../../utils/OTPGen";
import OTP from "../../models/OTP.model";
import Student, { IStudentDocument } from "../../models/Student.model";
import { sendTokenCookies } from "../../utils/Cookies";
import { Session } from "../../models/session.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/WebToken";
import { generateResetOtpEmailHtml } from "../../const/Mail/ResepOTP.templete";
import { FifteenMinutesFromNow, Now } from "../../utils/Date";

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
        photo
    } = req.body;

    const existingStudent = await Student.findOne({ indexNumber });
    if (existingStudent) {
        return res.status(400).json({ message: "Student already exists" });
    }

    await Student.create({
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
        photo
    });

    const otp = VerifyOTP();
    const html = generateOtpEmailHtml(otp);
    await SendMail(`${indexNumber}@studentmail.com`, "OTP Verification", html);

    await OTP.create({
        email: indexNumber,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Email",
    });

    return res.status(200).json({ message: "OTP sent successfully" });
});

// ! Verify Student OTP
export const VerifyStudentOTP = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, otp } = req.body;

    const otpData = await OTP.findOne({ email: indexNumber, Type: "Email" });
    if (!otpData || otpData.OTP !== otp || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const student = await Student.findOne({ indexNumber }) as IStudentDocument;
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isVerified = true;
    await student.save();
    await OTP.deleteOne({ email: indexNumber, Type: "Email" });

    const accessToken = generateAccessToken(student._id as string);
    const refreshToken = generateRefreshToken(student._id as string);

    await Session.create({
        studentId: student._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        date: Now(),
    });

    sendTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
        message: "OTP verified successfully",
        student: {
            id: student._id,
            name: student.name,
            indexNumber: student.indexNumber,
            verified: student.isVerified,
        },
    });
});

// ! Login Student
export const LoginStudent = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, password } = req.body;

    const student = await Student.findOne({ indexNumber }) as IStudentDocument;
    if (!student || !(await student.comparePass(password))) {
        return res.status(400).json({ message: "Invalid index number or password" });
    }

    const accessToken = generateAccessToken(student._id as string);
    const refreshToken = generateRefreshToken(student._id as string);

    await Session.create({
        studentId: student._id,
        accessToken,
        refreshToken,
        sessionType: "LOGIN",
        date: Now(),
    });

    sendTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
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
export const ForgotStudentPassword = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber } = req.body;

    const student = await Student.findOne({ indexNumber }) as IStudentDocument;
    if (!student) return res.status(400).json({ message: "Student not found" });

    const otp = VerifyOTP();
    const html = generateResetOtpEmailHtml(otp);
    await SendMail(`${indexNumber}@studentmail.com`, "Reset Password OTP", html);

    await OTP.create({
        email: indexNumber,
        OTP: otp,
        OTPexpire: FifteenMinutesFromNow(),
        Type: "Reset",
    });

    return res.status(200).json({ message: "Reset OTP sent" });
});

// ! Reset Password
export const ResetStudentPassword = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber, otp, newPassword } = req.body;

    const student = await Student.findOne({ indexNumber }) as IStudentDocument;
    const otpData = await OTP.findOne({ email: indexNumber, Type: "Reset" });

    if (!student || !otpData || otpData.OTP !== otp || otpData.OTPexpire < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    student.password = newPassword;
    await student.save();
    await OTP.deleteOne({ email: indexNumber, Type: "Reset" });

    return res.status(200).json({ message: "Password reset successfully" });
});

// ! Logout Student
export const LogoutStudent = TryCatch(async (req: Request, res: Response) => {
    const { indexNumber } = req.body;

    const student = await Student.findOne({ indexNumber }) as IStudentDocument;
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Session.deleteMany({ studentId: student._id });

    return res.status(200).json({ message: "Student logged out successfully" });
});
