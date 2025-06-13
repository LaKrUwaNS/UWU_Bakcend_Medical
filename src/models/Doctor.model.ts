import { Document, model, Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashing";

export interface IDoctor extends Document {
    userName: string;
    fullName: string;
    password: string;
    mobileNumber: string;
    personalEmail: string;
    professionalEmail: string;
    professionalEmailVerified: boolean;
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
    mobileNumber: { type: String, required: true, unique: true },
    personalEmail: { type: String, required: true, unique: true, validate: { validator: function(v: string) { return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v); }, message: 'Please enter a valid email address' } },
    professionalEmailVerified: { type: Boolean, default: false },
    professionalEmail: { type: String, required: true, unique: true, validate: { validator: function(v: string) { return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v); }, message: 'Please enter a valid email address' } },
    securityCode: { type: String, required: true, default: undefined },
    title: { type: String, required: true },
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




//! Functions
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
