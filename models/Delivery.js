import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    instructions: String
  },
  deliveryPerson: {
    name: String,
    phone: String,
    id: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'in-delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  trackingUrl: String,
  deliveryFee: Number,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number
    },
    notes: String
  }]
}, { timestamps: true });

export default mongoose.model('Delivery', deliverySchema);
