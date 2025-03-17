import { config } from "dotenv";
config();

import express from "express";
import mongoose from "mongoose";
import { createServer } from 'http';
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import reservationRoutes from './routes/reservation.js';
import inventoryRoutes from './routes/inventory.js';
import reportRoutes from './routes/reports.js';
import branchRoutes from './routes/branch.js';
import menuRoutes from './routes/menu.js';
import tableRoutes from './routes/table.js';
import orderRoutes from './routes/order.js';
import docsRouter from './routes/docs.js';
import staffRoutes from './routes/staff.js';
import paymentRoutes from './routes/payment.js';
import { initializeSocket } from './services/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
config({ path: path.join(__dirname, '.env') });
app.use(cors({
  origin: ['https://voluble-cendol-68fbbc.netlify.app'],
  credentials: true
}));
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://voluble-cendol-68fbbc.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/', docsRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected!");
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
