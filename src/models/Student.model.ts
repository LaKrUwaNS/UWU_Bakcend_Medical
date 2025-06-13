import { Schema, model } from 'mongoose';
import { comparePassword, hashPassword } from '../utils/hashing';

export interface IStudent {
    indexNumber: string;
    password: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    contactNumber: string[];
    emergencyNumber: string;
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string;
    degree: string;
    presentYear: number;
    department: string;
    isVerified: boolean;
    year?: number;
    photo?: string;
}

const studentSchema = new Schema<IStudent>({
    indexNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    contactNumber: { type: [String], required: true },
    emergencyNumber: { type: String, required: true },
    bloodType: { type: String, required: true },
    allergies: { type: String },
    degree: { type: String, required: true },
    presentYear: { type: Number, min: 1, max: 4, required: true },
    department: { type: String, required: true },
    photo: { type: String },
    year: { type: Number },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

studentSchema.pre("save", async function (next) {
    try {
        if (this && this.indexNumber && this.isModified('indexNumber')) {
            const parts = this.indexNumber.split('/');
            if (parts.length === 4) {
                this.department = parts[1];
                this.year = Number(parts[2]);
            }
        }

        if (this.isModified("password")) {
            this.password = await hashPassword(this.password, 10);
        }

        next();
    } catch (err: any) {
        next(err);
    }
});


studentSchema.methods.comparePass = async function (enteredPassword: string): Promise<boolean> {
    return comparePassword(enteredPassword, this.password);
};


const Student = model<IStudent>('Student', studentSchema);
export default Student;
