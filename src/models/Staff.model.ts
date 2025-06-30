import { Document, model, Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashing";

export interface IStaff extends Document {
    name: string;
    title: string;
    email: string;
    jobTitle: string;
    mobileNumber: string;
    photo?: string;
    password: string;
    securityCode: string;
    isVerified: boolean;
    isAvailable: boolean;
    reason?: string;
    expireAt?: Date | null;

    comparePass(enteredPassword: string): Promise<boolean>;
    compareSecurityCode(enteredCode: string): Promise<boolean>;
}

const staffSchema = new Schema<IStaff>(
    {
        name: { type: String, required: true },
        title: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        jobTitle: { type: String, required: true },
        mobileNumber: { type: String, required: true, unique: true },
        photo: { type: String },
        password: { type: String, required: true },
        securityCode: { type: String, required: true, default: undefined },
        isVerified: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true },
        reason: { type: String, enum: ['annual leave', 'sick leave', 'personal leave', 'absent'] },
        expireAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ TTL index to automatically delete documents after `expireAt`
staffSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// 🔐 Pre-save hook to hash password and security code
staffSchema.pre<IStaff>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password, 10);
    }

    if (this.isModified("securityCode") && this.securityCode) {
        this.securityCode = await hashPassword(this.securityCode, 10);
    }

    next();
});

// 🔐 Compare entered password with hashed password
staffSchema.methods.comparePass = async function (
    enteredPassword: string
): Promise<boolean> {
    return comparePassword(enteredPassword, this.password);
};

// 🔐 Compare entered security code with hashed security code
staffSchema.methods.compareSecurityCode = async function (
    enteredCode: string
): Promise<boolean> {
    return comparePassword(enteredCode, this.securityCode);
};

export const Staff = model<IStaff>("Staff", staffSchema);
