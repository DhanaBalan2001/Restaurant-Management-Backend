import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['staff', 'manager', 'kitchen'],
    default: 'staff'
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  schedule: {
    monday: {
      start: String,
      end: String
    },
    tuesday: {
      start: String,
      end: String
    },
    wednesday: {
      start: String,
      end: String
    },
    thursday: {
      start: String,
      end: String
    },
    friday: {
      start: String,
      end: String
    }
  }
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
