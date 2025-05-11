import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './services/socket.js';
import { httpLogger } from './middleware/httpLogger.js';
import { handleError } from './utils/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/order.js';
import reservationRoutes from './routes/reservation.js';
import inventoryRoutes from './routes/inventory.js';
import branchRoutes from './routes/branch.js';
import tableRoutes from './routes/table.js';
import staffRoutes from './routes/staff.js';
import customerRoutes from './routes/customer.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import paymentRoutes from './routes/payment.js';
import syncRoutes from './routes/sync.js';
import kitchenRoutes from './routes/kitchen.js';
import loyaltyRoutes from './routes/loyalty.js';
import deliveryRoutes from './routes/delivery.js';
import feedbackRoutes from './routes/feedback.js';


dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(httpLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handling middleware
app.use(handleError);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
