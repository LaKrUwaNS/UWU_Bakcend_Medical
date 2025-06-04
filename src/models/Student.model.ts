import { Schema, model, Document, Types } from 'mongoose';
import { hashPassword } from '../utils/hashing';

export interface IStudent extends Document {
    indexNumber: string;
    password: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    contactNumber: string[];
    emergencyNumber: string;
    bloodType?: string;
    allergies?: string;
    Degree: string;
    presentYear: number;
    department: string;
    isBlocked: boolean;
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
    presentYear: { type: Number, min: 1, max: 4, required: true },
    department: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    photo: { type: String },
    year: { type: Number }
});

studentSchema.pre("save", function (next) {
    if (this && this.indexNumber) {
        const Parts = this.indexNumber.split('/');
        if (Parts.length === 4) {
            this.department = Parts[1];
            this.year = Number(Parts[2]);
        }
    }
    next();
});

studentSchema.pre("save",async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await hashPassword(this.password, 10);
    }catch(error){
        
    }
})





const Student = model<IStudent>('Student', studentSchema);
export default Student;