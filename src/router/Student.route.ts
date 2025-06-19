import { Router } from "express";
import { TestMail } from "../controller/doctor/Auth.controller";
import { validateMiddleware } from "../middleware/validate.middleware";

// Import your student Zod schemas here
import {
    StudentregisterStudentSchema,
    StudentverifyStudentOtpSchema,
    StudentloginStudentSchema,
    StudentforgotPasswordSchema,
    StudentresetPasswordSchema,
    StudentlogoutStudentSchema
} from "../middleware/validate.middleware";  // Adjust path if needed

import {
    RegisterStudent,
    VerifyStudentOTP,
    LoginStudent,
    ForgotStudentPassword,
    ResetStudentPassword,
    LogoutStudent
} from "../controller/student/Auth.Student.controller";

const StudentRouter = Router();

// ! Test mail (you might want to move this to doctor router if it belongs there)
StudentRouter.post('/test', TestMail);   // localhost:5000/student/test

// ! Student Register
StudentRouter.post("/register", validateMiddleware(StudentregisterStudentSchema), RegisterStudent);      // localhost:5000/student/register

// ! Student Verify OTP
StudentRouter.post("/verify-otp", validateMiddleware(StudentverifyStudentOtpSchema), VerifyStudentOTP); // localhost:5000/student/verify-otp

// ! Student Login
StudentRouter.post("/login", validateMiddleware(StudentloginStudentSchema), LoginStudent);             // localhost:5000/student/login

// ! Student Forgot Password
StudentRouter.post("/forgot-password", validateMiddleware(StudentforgotPasswordSchema), ForgotStudentPassword); // localhost:5000/student/forgot-password

// ! Student Reset Password
StudentRouter.post("/reset-password", validateMiddleware(StudentresetPasswordSchema), ResetStudentPassword);       // localhost:5000/student/reset-password

// ! Student Logout
StudentRouter.post("/logout", validateMiddleware(StudentlogoutStudentSchema), LogoutStudent);            // localhost:5000/student/logout

export default StudentRouter;
