import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  location: { type: String },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied'],
    default: 'available'
  }
});

export default mongoose.model('Table', tableSchema);