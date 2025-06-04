import { Document, model, Schema } from "mongoose";

export interface IDoctor extends Document {
    userName: string;
    fullName: string;
    password: string;
    medicalEmail: string;
    medicalEmailVerified: boolean;
    universityEmail: string;
    securityCode: string;
    title: string;
    photo?: string;
}

const doctorSchema = new Schema<IDoctor>({
    userName: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    medicalEmail: { type: String, required: true },
    medicalEmailVerified: { type: Boolean, default: false },
    universityEmail: { type: String, required: true },
    securityCode: { type: String, required: true },
    title: { type: String, required: true },
    photo: { type: String },
});

export const Doctor = model<IDoctor>('Doctor', doctorSchema);