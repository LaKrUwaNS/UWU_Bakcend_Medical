import { Document, model, Schema } from "mongoose";

export interface IStaff extends Document {
    name: string;
    title: string;
    email: string;
    jobTitle: string;
    mobileNumber: string;
    photo?: string;
}

const staffSchema = new Schema<IStaff>({
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    photo: { type: String },
});

export const Staff = model<IStaff>('Staff', staffSchema);