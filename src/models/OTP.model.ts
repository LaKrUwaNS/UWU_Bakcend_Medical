import { Document, model, Schema } from "mongoose";

export interface IOTP extends Document {
    email: string;
    code: string;
    createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const OTP = model<IOTP>('OTP', otpSchema);
