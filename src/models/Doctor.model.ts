import { Document, model, Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashing";

export interface IDoctor extends Document {
    userName: string;
    fullName: string;
    password: string;
    medicalEmail: string;
    universityEmail: string;
    medicalEmailVerified: boolean;
    securityCode: string;
    title: string;
    photo?: string;

    comparePass: (enteredPassword: string) => Promise<boolean>;
    compareSecurityCode: (enteredCode: string) => Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>({
    userName: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    medicalEmail: { type: String, required: true },
    medicalEmailVerified: { type: Boolean, default: false },
    universityEmail: { type: String, required: true },
    securityCode: { type: String, required: true, default: undefined },
    title: { type: String, required: true },
    photo: { type: String },
}, { timestamps: true });

// Pre-save hook
doctorSchema.pre<IDoctor>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password, 10);
    }

    if (this.isModified("securityCode") && this.securityCode) {
        this.securityCode = await hashPassword(this.securityCode, 10);
    }

    next();
});

// Instance method to compare password
doctorSchema.methods.comparePass = async function (enteredPassword: string): Promise<boolean> {
    return comparePassword(enteredPassword, this.password);
};

// Instance method to compare security code
doctorSchema.methods.compareSecurityCode = async function (enteredCode: string): Promise<boolean> {
    return comparePassword(enteredCode, this.securityCode);
};

const Doctor = model<IDoctor>('Doctor', doctorSchema);
export default Doctor;
