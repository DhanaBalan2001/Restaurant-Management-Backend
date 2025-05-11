import mongoose from "mongoose";

const customizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [{
    name: { type: String, required: true },
    price: { type: Number, default: 0 }
  }],
  required: { type: Boolean, default: false },
  multiSelect: { type: Boolean, default: false }
});

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['appetizers', 'drinks', 'maincourse', 'desserts'] },
  isAvailable: { type: Boolean, default: true },
  availabilityStatus: { type: String, required: true, enum: ['in-stock', 'out-of-stock'], default: 'in-stock' },
  image: { type: String },
  customizationOptions: [customizationOptionSchema],
  allergens: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  preparationTime: Number // in minutes
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);