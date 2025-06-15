import { Document, model, Schema } from "mongoose";

// 1. Interface definition
export interface IOTP extends Document {
    email: string;
    OTP: string;
    OTPexpire: Date;
    createdAt: Date;
    Type: 'Email' | 'Reset';
}

// 2. Schema definition
const otpSchema = new Schema<IOTP>({
    email: { type: String, required: true },
    OTP: { type: String, required: true },
    OTPexpire: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    Type: { type: String, enum: ['Email', 'Reset'], required: true, default: 'Email' },
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

// 3. Export model
const OTP = model<IOTP>('OTP', otpSchema);
export default OTP;
