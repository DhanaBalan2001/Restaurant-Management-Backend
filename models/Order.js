import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'Menu' },
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: { type: Date, default: Date.now }
});

export default model('Order', orderSchema);