import { Document, model, Schema, Types } from "mongoose";


export interface ISession extends Document {
    date: Date;
    sessionType: 'LOGIN' | 'LOGOUT';
    doctorId?: Types.ObjectId;
    staffId?: Types.ObjectId;
    studentId?: Types.ObjectId;
    accessToken: string;
    refreshToken: string;
    isAvailable: boolean;
}

const sessionSchema = new Schema<ISession>({
    date: { type: Date, required: true },
    sessionType: { type: String, enum: ['LOGIN', 'LOGOUT'], required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
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

export const Session = model<ISession>('Session', sessionSchema);