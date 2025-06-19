import { Router } from "express";
import { DoctorLogging, ForgotPassword, Logout, RegisterDoctor, ResetPassword, TestMail, VerifyRegisterOTP } from "../controller/doctor/Auth.controller";
import { doctorZodSchema, validateMiddleware } from "../middleware/validate.middleware";
import { otpVerificationSchema } from "../middleware/validate.middleware";
import { loginSchema } from "../middleware/validate.middleware";
import { forgotPasswordSchema } from "../middleware/validate.middleware";
import { resetPasswordSchema } from "../middleware/validate.middleware";


const DoctorRouter = Router();

// !Test mail
DoctorRouter.post('/test', TestMail);   // localhost:5000/doctor/test

// !Doctor Register
DoctorRouter.post("/register", validateMiddleware(doctorZodSchema), RegisterDoctor);      //localhost:5000/doctor/register
DoctorRouter.post("/verify-otp", validateMiddleware(otpVerificationSchema), VerifyRegisterOTP); //localhost:5000/doctor/verify-otp

// !Doctor Login
DoctorRouter.post("/login", validateMiddleware(loginSchema), DoctorLogging); //localhost:5000/doctor/login

// !Doctor Forgot Password
DoctorRouter.post("/forgot-password", validateMiddleware(forgotPasswordSchema), ForgotPassword); //localhost:5000/doctor/forgot-password

// !Doctor Reset Password
DoctorRouter.post("/reset-password", validateMiddleware(resetPasswordSchema), ResetPassword); //localhost:5000/doctor/reset-password

// !Doctor Logout
DoctorRouter.post("/logout", Logout); //localhost:5000/doctor/logout



export default DoctorRouter;