import { model, Schema, Types, Document } from "mongoose";

interface IDrugEntry {
    medicineId: Types.ObjectId;
    quantity: number;
}

export interface IPrescription extends Document {
    sessionId: Types.ObjectId;
    studentId: Types.ObjectId;
    doctorId: Types.ObjectId;
    date: Date;
    description: string;
    drugs: IDrugEntry[];
    inventoryId: Types.ObjectId;
    queueStatus: 'waiting' | 'serving' | 'done'; // NEW FIELD
}

const prescriptionSchema = new Schema<IPrescription>(
    {
        sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
        date: { type: Date, required: true },
        description: { type: String, required: true },
        drugs: [
            {
                medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },

        // ✅ New field to track queue progress
        queueStatus: {
            type: String,
            enum: ['waiting', 'serving', 'done'],
            default: 'waiting',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

export const Prescription = model<IPrescription>('Prescription', prescriptionSchema);
