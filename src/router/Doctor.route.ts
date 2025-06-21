import { Router } from "express";
import { DoctorLogging, ForgotPassword, Logout, RegisterDoctor, ResetPassword, TestMail, TestMulter, VerifyRegisterOTP } from "../controller/doctor/Auth.controller";
import { RegisterDoctorZodSchema, validateMiddleware } from "../middleware/validate.middleware";
import { otpVerificationSchema } from "../middleware/validate.middleware";
import { loginSchema } from "../middleware/validate.middleware";
import { forgotPasswordSchema } from "../middleware/validate.middleware";
import { resetPasswordSchema } from "../middleware/validate.middleware";

import { getDashBoard } from "../controller/doctor/pages/Dashboard.controller";
import { ProfilePhotoupload } from "../controller/doctor/Auth.controller";
import { upload } from "../config/Multer";
import { isDoctorLogin } from "../middleware/CheckLogin/isDotorlogin";

const DoctorRouter = Router();

// Public Router

// !Testing Routers
DoctorRouter.post('/test', TestMail);   // localhost:5000/doctor/test
DoctorRouter.post('/test-multer', upload.single("image"), TestMulter);   // localhost:5000/doctor/test-multer



// !Doctor Register
DoctorRouter.post("/register", validateMiddleware(RegisterDoctorZodSchema), RegisterDoctor);      //localhost:5000/doctor/register
DoctorRouter.post("/verify-otp", validateMiddleware(otpVerificationSchema), VerifyRegisterOTP); //localhost:5000/doctor/verify-otp


// !Doctor Login
DoctorRouter.post("/login", validateMiddleware(loginSchema), DoctorLogging); //localhost:5000/doctor/login

// !Doctor Forgot Password
DoctorRouter.post("/forgot-password", validateMiddleware(forgotPasswordSchema), ForgotPassword); //localhost:5000/doctor/forgot-password

// !Doctor Reset Password
DoctorRouter.post("/reset-password", validateMiddleware(resetPasswordSchema), ResetPassword); //localhost:5000/doctor/reset-password

// !Doctor Logout
DoctorRouter.post("/logout", Logout); //localhost:5000/doctor/logout



// Page Routers Need to Login user to process

// !Doctor Dashboard
DoctorRouter.get("/dashboard", isDoctorLogin, getDashBoard); //localhost:5000/doctor/dashboard
// !Doctor Profile Photo Upload
DoctorRouter.post("/profile-photo-upload", isDoctorLogin, upload.single("image"), ProfilePhotoupload); //localhost:5000/doctor/profile-photo-upload


export default DoctorRouter;