import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/CheckLogin/isDotorlogin";
import { Prescription } from "../../../models/prescription.model";
import { TryCatch } from "../../../utils/Error/ErrorHandler";
import { Staff } from "../../../models/Staff.model";
import { MedicalRequest } from "../../../models/MedicalRequest.model";

export const getDashBoard = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const Doctor = req.user;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
        StudentCount, // prescription issued students count
        StaffCont, // Working Staff today
        NotAvailableStaffCount, // Not Available Staff today
        absentStaffCount, // Absent Staff today
        Todayrequests, // today requests list
        TodayrequestCount, // today requests count
        Nextpatient, // next patient
        TodayPrescriptionCount, // today prescription count
    ] = await Promise.all([
        Prescription.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday }, queueStatus: 'done' }),
        Staff.countDocuments({ isAvailable: true }),
        Staff.countDocuments({ isAvailable: false }),
        Staff.countDocuments({ reason: 'absent' }),
        MedicalRequest.find({ date: { $gte: startOfToday, $lte: endOfToday } }),
        MedicalRequest.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
        MedicalRequest.findOne({
            date: { $gte: startOfToday, $lte: endOfToday },
            status: "pending"
        })
            .sort({ schedule: 1 })
            .populate({ path: "studentId", select: "indexNumber" })
            .exec(),
        Prescription.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday }, queueStatus: 'done' }),
    ]);

    res.status(200).json({
        StudentCount,
        StaffCont,
        NotAvailableStaffCount,
        absentStaffCount,
        Todayrequests,
        TodayrequestCount,
        Nextpatient,
        TodayPrescriptionCount,
    });
});
