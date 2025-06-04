import { Document, model, Schema } from "mongoose";

export interface IInventory extends Document {
    inventoryKey: string;
    quantity: number;
}

const inventorySchema = new Schema<IInventory>({
    inventoryKey: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
});

export const Inventory = model<IInventory>('Inventory', inventorySchema);