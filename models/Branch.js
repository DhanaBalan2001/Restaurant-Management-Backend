import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }
  },
  contactNumber: {
    type: String,
    required: true
  },
  manager: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  operatingHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '22:00'
    }
  }
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);