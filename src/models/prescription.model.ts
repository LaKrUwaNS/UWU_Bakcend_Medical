import { model, Schema, Types } from "mongoose";


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
}

const prescriptionSchema = new Schema<IPrescription>({
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
});

export const Prescription = model<IPrescription>('Prescription', prescriptionSchema);