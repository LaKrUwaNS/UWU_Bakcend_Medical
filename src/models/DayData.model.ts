import { Document, model, Schema, Types } from "mongoose";

export interface IDailyPresence extends Document {
    date: Date;  // The specific day of attendance/presence
    doctors: Types.ObjectId[];  // Array of Doctor IDs present that day
    staff: Types.ObjectId[];    // Array of Staff IDs present that day
    students?: Types.ObjectId[]; // Optional: students present that day
    notes?: string;             // Optional notes for that day
    createdAt: Date;
    updatedAt: Date;
}

const dailyPresenceSchema = new Schema<IDailyPresence>(
    {
        date: { type: Date, required: true, unique: true },  // Unique per day
        doctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor', required: true }],
        staff: [{ type: Schema.Types.ObjectId, ref: 'Staff', required: true }],
        students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        notes: { type: String }
    },
    {
        timestamps: true
    }
);

// Optional: create index on date for faster queries if you expect lots of records
dailyPresenceSchema.index({ date: 1 }, { unique: true });

export const DayDate = model<IDailyPresence>('DailyPresence', dailyPresenceSchema);
