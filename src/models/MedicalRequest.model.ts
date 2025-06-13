import { Document, model, Schema, Types } from "mongoose";


export interface IMedicalRequest extends Document {
    studentId: Types.ObjectId;
    requestId: string;
    date: Date;
    schedule: Date;
    status: 'pending' | 'approved' | 'rejected';
    timeNeeded: string;
    reason: string;
}

const medicalRequestSchema = new Schema<IMedicalRequest>({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    requestId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    schedule: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    timeNeeded: { type: String, required: true },
    reason: { type: String, required: true },
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    });

export const MedicalRequest = model<IMedicalRequest>('MedicalRequest', medicalRequestSchema);
