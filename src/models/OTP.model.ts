import { Document, model, Schema } from "mongoose";
import { comparePassword, hashPassword } from "../utils/hashing";

// 1. Interface definition
export interface IOTP extends Document {
    email: string;
    OTP: string;
    OTPexpire: Date;
    createdAt: Date;
    Type: 'Email' | 'Reset';
    compareOtp: (otp: string) => Promise<boolean>;
}

// 2. Schema definition
const otpSchema = new Schema<IOTP>(
    {
        email: { type: String, required: true },
        OTP: { type: String, required: true },
        OTPexpire: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        Type: { type: String, enum: ['Email', 'Reset'], required: true, default: 'Email' }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ TTL index for automatic deletion based on OTPexpire
otpSchema.index({ OTPexpire: 1 }, { expireAfterSeconds: 0 });

// 🔐 Hash the OTP before saving
otpSchema.pre('save', async function (next) {
    if (this.isModified('OTP')) {
        this.OTP = await hashPassword(this.OTP, 10);
    }
    next();
});

// 🔐 Compare OTP method
otpSchema.methods.compareOtp = async function (otp: string): Promise<boolean> {
    return await comparePassword(otp, this.OTP);
};

const OTP = model<IOTP>('OTP', otpSchema);
export default OTP;
