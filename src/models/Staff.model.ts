import { Document, model, Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashing"; // Make sure these are implemented

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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Pre-save hook to hash password and security code before saving
staffSchema.pre<IStaff>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password, 10);
    }

    if (this.isModified("securityCode") && this.securityCode) {
        this.securityCode = await hashPassword(this.securityCode, 10);
    }

    next();
});

// Instance method to compare entered password with hashed password
staffSchema.methods.comparePass = async function (
    enteredPassword: string
): Promise<boolean> {
    return comparePassword(enteredPassword, this.password);
};

// Instance method to compare entered security code with hashed security code
staffSchema.methods.compareSecurityCode = async function (
    enteredCode: string
): Promise<boolean> {
    return comparePassword(enteredCode, this.securityCode);
};

export const Staff = model<IStaff>("Staff", staffSchema);
