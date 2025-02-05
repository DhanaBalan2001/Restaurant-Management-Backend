import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['appetizers', 'drinks', 'maincourse', 'desserts'] },
  isAvailable: { type: Boolean, default: true },
  availabilityStatus: { type: String, required: true, enum: ['in-stock', 'out-of-stock'], default: 'instock' },
  image: { type: String },
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);