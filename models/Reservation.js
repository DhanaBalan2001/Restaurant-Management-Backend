import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  guestCount: { type: Number, required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  status: { type: String, default: 'pending' },
  paymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);