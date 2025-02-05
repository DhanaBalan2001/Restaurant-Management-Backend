import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff','customer'], required: true },
  phoneNumber: String,
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
