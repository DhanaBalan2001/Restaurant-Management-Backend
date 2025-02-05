import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalSales: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  itemsSold: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: Number,
    revenue: Number
  }],
  peakHours: [{
    timeSlot: String,
    orderCount: Number
  }]
}, { timestamps: true });

export default mongoose.model('Analytics', analyticsSchema);
