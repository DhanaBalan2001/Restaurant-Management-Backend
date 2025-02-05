import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  minThreshold: { type: Number, required: true },
  category: { type: String, required: true },
  supplier: { type: String },
  lastRestocked: { type: Date },
  price: { type: Number }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);
