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
import { createPrescription, getStudentMedicalProfile, getStudentPrescriptions, updatePrescriptionStatus } from "../controller/doctor/pages/StudentsDate.controller";
import { deleteMedicine, getMedicineList, addNewMedicine, updateMedicine } from "../controller/doctor/pages/Medicine.controller";

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


// Student Data Page Routers

// !Doctor Students Date
DoctorRouter.get("/students-date/:id", isDoctorLogin, getStudentMedicalProfile); //localhost:5000/doctor/students-date/:id
// !Doctor Adding New Prescription
DoctorRouter.post("/adding-new-prescription", isDoctorLogin, getStudentPrescriptions); //localhost:5000/doctor/adding-new-prescription
// !Doctor Sending Medicine Data
DoctorRouter.post("/sending-medicine-data/:id", isDoctorLogin, createPrescription); //localhost:5000/doctor/sending-medicine-data/:id
// !Doctor Update Prescription Status
DoctorRouter.patch("/update-prescription-status/:id", isDoctorLogin, updatePrescriptionStatus); //localhost:5000/doctor/update-prescription-status/:id



// Medicine Page Routers

// !Doctor Medicine List
DoctorRouter.get("/medicine-list", isDoctorLogin, getMedicineList); //localhost:5000/doctor/medicine-list
// !Doctor Adding New Medicine
DoctorRouter.post("/adding-new-medicine", isDoctorLogin, addNewMedicine); //localhost:5000/doctor/adding-new-medicine
// !Doctor Updating Medicine
DoctorRouter.put("/updating-medicine/:id", isDoctorLogin, updateMedicine); //localhost:5000/doctor/updating-medicine/:id
// !Doctor Deleting Medicine
DoctorRouter.delete("/deleting-medicine/:id", isDoctorLogin, deleteMedicine); //localhost:5000/doctor/deleting-medicine/:id











export default DoctorRouter;