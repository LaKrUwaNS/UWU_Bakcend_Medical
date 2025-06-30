import { Document, model, Schema, Types } from "mongoose";
import { FifteenMinutesFromNow } from "../utils/Date";

export interface ISession extends Document {
    date: Date;
    doctorId?: Types.ObjectId;
    staffId?: Types.ObjectId;
    studentId?: Types.ObjectId;
    accessToken: string;
    sessionType: 'LOGIN' | 'LOGOUT';
    expireAt: Date;
    isActive(): boolean;
}

const sessionSchema = new Schema<ISession>(
    {
        date: { type: Date, required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        accessToken: { type: String, required: true },
        sessionType: { type: String, enum: ['LOGIN', 'LOGOUT'], required: true },
        expireAt: {
            type: Date,
            required: true,
            default: () => FifteenMinutesFromNow()
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ TTL index to delete expired sessions automatically
sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Ensure exactly one of doctor, staff, or student is referenced
sessionSchema.pre('save', function (next) {
    const session = this as ISession;
    const refs = [session.doctorId, session.staffId, session.studentId].filter(Boolean);

    if (refs.length !== 1) {
        return next(new Error('Exactly one of doctorId, staffId, or studentId must be provided.'));
    }

    next();
});

// ✅ Method to check if session is still active
sessionSchema.methods.isActive = function (): boolean {
    const session = this as ISession;
    return new Date() < session.expireAt;
};

export const Session = model<ISession>('Session', sessionSchema);
