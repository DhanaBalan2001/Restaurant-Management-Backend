import mongoose from "mongoose";

const loyaltySchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  points: { 
    type: Number, 
    default: 0 
  },
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    default: 'bronze' 
  },
  pointsHistory: [{
    points: Number,
    reason: String,
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order' 
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }],
  rewards: [{
    type: { 
      type: String, 
      enum: ['discount', 'freeItem', 'freeDelivery'] 
    },
    value: Number,
    description: String,
    isUsed: { 
      type: Boolean, 
      default: false 
    },
    expiryDate: Date,
    usedDate: Date
  }]
}, { timestamps: true });

// Calculate tier based on points
loyaltySchema.pre('save', function(next) {
  if (this.points >= 1000) {
    this.tier = 'platinum';
  } else if (this.points >= 500) {
    this.tier = 'gold';
  } else if (this.points >= 200) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
  next();
});

export default mongoose.model('Loyalty', loyaltySchema);
