import { model, Schema, Types } from "mongoose";

export interface IMedicine extends Document {
    medicineName: string;
    status: 'in stock' | 'low' | 'out';
    quantity: number;
    inventoryKey: string;
    inventoryId: Types.ObjectId;
}

const medicineSchema = new Schema<IMedicine>({
    medicineName: { type: String, required: true },
    status: { type: String, enum: ['in stock', 'low', 'out'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    inventoryKey: { type: String, required: true },
    inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
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

export const Medicine = model<IMedicine>('Medicine', medicineSchema);