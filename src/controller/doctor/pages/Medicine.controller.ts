import { AuthenticatedRequest } from "../../../middleware/CheckLogin/isDotorlogin";
import { Inventory } from "../../../models/Inventory.model";
import { IMedicine, Medicine } from "../../../models/Medicine.model";
import { TryCatch } from "../../../utils/Error/ErrorHandler";
import { sendResponse } from "../../../utils/response";
import { Response } from "express";
import { Types } from "mongoose";

/**
 * @description Get list of all medicines
 * @route GET /api/medicines
 * @access Authenticated
 */
export const getMedicineList = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const medicines = await Medicine.find().populate('inventoryId', 'inventoryKey');
    return sendResponse(res, 200, true, "Medicines retrieved successfully", medicines);
});

/**
 * @description Add new medicine to inventory
 * @route POST /api/medicines
 * @access Authenticated
 */
export const addNewMedicine = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { medicineName, status, quantity, inventoryKey, inventoryId } = req.body;

    // Validate required fields
    if (!medicineName || !quantity || !inventoryId) {
        return sendResponse(res, 400, false, "Medicine name, quantity and inventory ID are required");
    }

    // Validate inventory exists
    const inventoryExists = await Inventory.exists({ _id: inventoryId });
    if (!inventoryExists) {
        return sendResponse(res, 404, false, "Inventory not found");
    }

    // Create new medicine
    const medicine = await Medicine.create({
        medicineName,
        status: status || 'in stock',
        quantity,
        inventoryKey,
        inventoryId: new Types.ObjectId(inventoryId)
    });

    return sendResponse(res, 201, true, "Medicine added successfully", medicine);
});

/**
 * @description Update medicine details
 * @route PUT /api/medicines/:id
 * @access Authenticated
 */
export const updateMedicine = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { medicineName, status, quantity, inventoryKey, inventoryId } = req.body;

    // Validate medicine exists
    const existingMedicine = await Medicine.findById(id);
    if (!existingMedicine) {
        return sendResponse(res, 404, false, "Medicine not found");
    }

    // Build update object
    const updateData: Partial<IMedicine> = {};

    if (medicineName !== undefined) updateData.medicineName = medicineName;
    if (status !== undefined) {
        if (!['in stock', 'low', 'out'].includes(status)) {
            return sendResponse(res, 400, false, "Invalid status value");
        }
        updateData.status = status;
    }
    if (quantity !== undefined) {
        if (isNaN(quantity) || quantity < 0) {
            return sendResponse(res, 400, false, "Quantity must be a positive number");
        }
        updateData.quantity = quantity;
    }
    if (inventoryKey !== undefined) updateData.inventoryKey = inventoryKey;
    if (inventoryId !== undefined) {
        const inventoryExists = await Inventory.exists({ _id: inventoryId });
        if (!inventoryExists) {
            return sendResponse(res, 404, false, "Inventory not found");
        }
        updateData.inventoryId = new Types.ObjectId(inventoryId);
    }

    // Check if any valid fields were provided
    if (Object.keys(updateData).length === 0) {
        return sendResponse(res, 400, false, "No valid fields provided for update");
    }

    // Perform update
    const updatedMedicine = await Medicine.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('inventoryId', 'inventoryKey');

    return sendResponse(res, 200, true, "Medicine updated successfully", updatedMedicine);
});

/**
 * @description Delete a medicine
 * @route DELETE /api/medicines/:id
 * @access Authenticated
 */
export const deleteMedicine = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return sendResponse(res, 400, false, "Medicine ID is required");
    }

    const medicine = await Medicine.findByIdAndDelete(id);
    if (!medicine) {
        return sendResponse(res, 404, false, "Medicine not found");
    }

    return sendResponse(res, 200, true, "Medicine deleted successfully", medicine);
});

/**
 * @description Get inventory data
 * @route GET /api/inventory
 * @access Authenticated
 */
export const getInventoryData = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const inventory = await Inventory.findById(req.user.inventoryId)
        .populate('medicines', 'medicineName quantity status');

    if (!inventory) {
        return sendResponse(res, 404, false, "Inventory not found");
    }

    return sendResponse(res, 200, true, "Inventory retrieved successfully", inventory);
});