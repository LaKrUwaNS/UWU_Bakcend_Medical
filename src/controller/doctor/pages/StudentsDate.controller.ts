import { AuthenticatedRequest } from "../../../middleware/CheckLogin/isDotorlogin";
import { Response } from "express";
import { TryCatch } from "../../../utils/Error/ErrorHandler";
import { sendResponse } from "../../../utils/response";
import Student from "../../../models/Student.model";
import { Prescription } from "../../../models/prescription.model";
import { MedicalRequest } from "../../../models/MedicalRequest.model";
import { Medicine } from "../../../models/Medicine.model";
import { Inventory } from "../../../models/Inventory.model";
import { SortOrder } from "mongoose";

/**
 * @description Get complete medical profile of a student including prescriptions and medical requests
 * @route GET /api/medical/student/:id
 * @access Doctor
 */
export const getStudentMedicalProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
        return sendResponse(res, 400, false, "Valid student ID is required");
    }

    const student = await Student.findById(id).select('-password');
    if (!student) {
        return sendResponse(res, 404, false, "Student not found");
    }

    const [prescriptions, medicalRequests] = await Promise.all([
        Prescription.find({ studentId: id })
            .populate('doctorId', 'fullName title')
            .populate('drugs.medicineId', 'medicineName status')
            .sort({ date: -1 as SortOrder }), // Fixed sort typing
        MedicalRequest.find({ studentId: id })
            .sort({ date: -1 as SortOrder }) // Fixed sort typing
    ]);

    return sendResponse(res, 200, true, "Student medical profile retrieved", {
        student,
        prescriptions,
        medicalRequests
    });
});

/**
 * @description Get all prescriptions for a student with pagination
 * @route GET /api/medical/student/:id/prescriptions
 * @access Doctor
 */
export const getStudentPrescriptions = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, limit = '10', page = '1' } = req.query;

    if (!id) {
        return sendResponse(res, 400, false, "Student ID is required");
    }

    const query: Record<string, any> = { studentId: id };
    if (status) {
        if (!['waiting', 'serving', 'done'].includes(status as string)) {
            return sendResponse(res, 400, false, "Invalid status value");
        }
        query.queueStatus = status;
    }

    const limitNumber = parseInt(limit as string);
    const pageNumber = parseInt(page as string);
    const skipNumber = (pageNumber - 1) * limitNumber;

    const options = {
        limit: limitNumber,
        skip: skipNumber,
        sort: { date: -1 as SortOrder } // Properly typed sort
    };

    const [prescriptions, total] = await Promise.all([
        Prescription.find(query)
            .populate('doctorId', 'fullName title')
            .populate('drugs.medicineId', 'medicineName status')
            .limit(options.limit)
            .skip(options.skip)
            .sort(options.sort),
        Prescription.countDocuments(query)
    ]);

    return sendResponse(res, 200, true, "Prescriptions retrieved", {
        prescriptions,
        pagination: {
            total,
            page: pageNumber,
            pages: Math.ceil(total / options.limit),
            limit: options.limit
        }
    });
});

/**
 * @description Create a new prescription for a student
 * @route POST /api/medical/prescriptions
 * @access Doctor
 */
export const createPrescription = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { indexNumber, medicines, description } = req.body;
    const doctorId = req.user._id;
    const date = new Date();

    // Validate required fields
    if (!indexNumber || !medicines || !description) {
        return sendResponse(res, 400, false, "Index number, medicines, and description are required");
    }

    // Find student
    const student = await Student.findOne({ indexNumber });
    if (!student) {
        return sendResponse(res, 404, false, "Student not found");
    }

    // Validate medicines array
    if (!Array.isArray(medicines) || medicines.length === 0) {
        return sendResponse(res, 400, false, "At least one medicine is required");
    }

    // Check inventory exists
    const inventory = await Inventory.findById(req.user.inventoryId);
    if (!inventory) {
        return sendResponse(res, 404, false, "Inventory not found");
    }

    // Prepare prescription drugs and validate medicine availability
    const prescriptionDrugs = [];
    const medicineUpdates = [];

    for (const item of medicines) {
        if (!item.medicineName || !item.quantity) {
            return sendResponse(res, 400, false, "Each medicine must have a name and quantity");
        }

        const medicine = await Medicine.findOne({
            medicineName: item.medicineName,
            inventoryId: inventory._id
        });

        if (!medicine) {
            return sendResponse(res, 404, false, `Medicine ${item.medicineName} not found in inventory`);
        }

        if (medicine.quantity < item.quantity) {
            return sendResponse(res, 400, false,
                `Not enough ${medicine.medicineName} in stock. Available: ${medicine.quantity}, Requested: ${item.quantity}`
            );
        }

        prescriptionDrugs.push({
            medicineId: medicine._id,
            quantity: item.quantity
        });

        medicineUpdates.push({
            updateOne: {
                filter: { _id: medicine._id },
                update: { $inc: { quantity: -item.quantity } }
            }
        });
    }

    // Create prescription
    const prescription = await Prescription.create({
        studentId: student._id,
        doctorId,
        date,
        description,
        drugs: prescriptionDrugs,
        inventoryId: inventory._id,
        queueStatus: "waiting"
    });

    // Update medicine quantities
    await Medicine.bulkWrite(medicineUpdates);

    return sendResponse(res, 201, true, "Prescription created successfully", {
        prescription,
        updatedMedicines: medicineUpdates.length
    });
});

/**
 * @description Update prescription status
 * @route PATCH /api/medical/prescriptions/:id/status
 * @access Doctor
 */
export const updatePrescriptionStatus = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        return sendResponse(res, 400, false, "Prescription ID is required");
    }

    if (!status || !['waiting', 'serving', 'done'].includes(status)) {
        return sendResponse(res, 400, false, "Valid status is required (waiting, serving, done)");
    }

    const prescription = await Prescription.findByIdAndUpdate(
        id,
        { queueStatus: status },
        { new: true }
    ).populate('drugs.medicineId', 'medicineName');

    if (!prescription) {
        return sendResponse(res, 404, false, "Prescription not found");
    }

    return sendResponse(res, 200, true, "Prescription status updated", prescription);
});