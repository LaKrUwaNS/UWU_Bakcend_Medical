import { Document, model, Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashing";

export interface IDoctor extends Document {
    _id: Schema.Types.ObjectId;
    userName: string;
    fullName: string;
    password: string;
    mobileNumber: string;
    personalEmail: string;
    professionalEmail: string;
    Verified: boolean;
    securityCode: string;
    title: string;
    expireAt: Date | null;
    photo?: string;

    Doctorpasswordcompare: (enteredPassword: string) => Promise<boolean>;
    compareSecurityCode: (enteredCode: string) => Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>({
    userName: { type: String },
    fullName: { type: String },
    password: { type: String },
    mobileNumber: { type: String },
    personalEmail: { type: String },
    Verified: { type: Boolean, default: false },
    professionalEmail: { type: String },
    securityCode: { type: String, default: undefined },
    title: { type: String },
    expireAt: { type: Date, default: null },
    photo: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

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
doctorSchema.methods.Doctorpasswordcompare = async function (enteredPassword: string): Promise<boolean> {
    return comparePassword(enteredPassword, this.password);
};

// Instance method to compare security code
doctorSchema.methods.compareSecurityCode = async function (enteredCode: string): Promise<boolean> {
    return comparePassword(enteredCode, this.securityCode);
};

const Doctor = model<IDoctor>('Doctor', doctorSchema);
export default Doctor;
