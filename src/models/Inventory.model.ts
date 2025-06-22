import { Document, model, Schema } from "mongoose";

export interface IInventory extends Document {
    inventoryKey: string;
    quantity: number;
    //medicines: Schema.Types.ObjectId[];
}

const inventorySchema = new Schema<IInventory>({
    inventoryKey: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    //medicines: [{ type: Schema.Types.ObjectId, ref: 'Medicine' }],
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

//inventorySchema.virtual('medicines', {
//    ref: 'Medicine',
//    localField: '_id',
//    foreignField: 'inventoryId',
//});

export const Inventory = model<IInventory>('Inventory', inventorySchema);