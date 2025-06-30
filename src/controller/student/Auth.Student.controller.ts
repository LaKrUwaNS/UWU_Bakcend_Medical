import { TryCatch } from "../../utils/Error/ErrorHandler";
import { Request, Response } from "express";
import { sendResponse } from "../../utils/response";
import Student from "../../models/Student.model";
import { cloudinary } from "../../config/Claudenary";
import { CreateOTP } from "../../utils/OTPGen";


// Register and sending the OTP
export const registerStudent = TryCatch(async (req, res) => {
    const photo = req.file as Express.Multer.File | undefined;
    const { indexNumber, password, name, gender, contactNumber, emergencyNumber, bloodType, allergies, degree, presentYear, department } = req.body;

    const AlreadyExit = await Student.findOne({ indexNumber });
    if (AlreadyExit) {
        return sendResponse(res, 400, false, "Student already exists with this index number");
    }
    let uploadResult;
    if (photo) {
        // Upload the file to Cloudinary
        uploadResult = await cloudinary.uploader.upload(photo.path, {
            folder: "students_photos",
        });
    }
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
        department,
        photo: uploadResult ? uploadResult.secure_url : undefined,

    });
})

const OTP = CreateOTP();




// Varify OTP

// Login

// Logout

// Fogot Password

// Reset Password

// Update Profile

// Get Profile