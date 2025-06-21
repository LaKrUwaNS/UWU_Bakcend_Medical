import { Document, model, Schema, Types } from "mongoose";

export interface ISession extends Document {
    date: Date;
    doctorId?: Types.ObjectId;
    staffId?: Types.ObjectId;
    studentId?: Types.ObjectId;
    accessToken: string;
    sessionType: string;
    expireAt: Date;
}

const sessionSchema = new Schema<ISession>(
    {
        date: { type: Date, required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        accessToken: { type: String, required: true },
        sessionType: { type: String, enum: ['LOGIN', 'LOGOUT'], required: true },
        expireAt: { type: Date, required: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ Custom validator: only one of the user fields must be set
sessionSchema.pre('save', function (next) {
    const session = this as ISession;
    const refs = [session.doctorId, session.staffId, session.studentId].filter(Boolean);

    if (refs.length !== 1) {
        return next(new Error('Exactly one of doctorId, staffId, or studentId must be provided.'));
    }

    next();
});

export const Session = model<ISession>('Session', sessionSchema);
