import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  foodQuality: { 
    type: Number, 
    min: 1,
    max: 5
  },
  service: { 
    type: Number, 
    min: 1,
    max: 5
  },
  ambience: { 
    type: Number, 
    min: 1,
    max: 5
  },
  valueForMoney: { 
    type: Number, 
    min: 1,
    max: 5
  },
  comment: { 
    type: String 
  },
  images: [{ 
    type: String 
  }],
  status: {
    type: String,
    enum: ['pending', 'published', 'hidden'],
    default: 'pending'
  },
  adminResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
