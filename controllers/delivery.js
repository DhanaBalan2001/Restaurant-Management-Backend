import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';
import Logger from '../utils/logger.js';
import {EmailService} from '../services/email.js';
import { getIO } from '../services/socket.js';

// Mock delivery service integration
const deliveryService = {
  createDelivery: async (orderDetails, address) => {
    // In a real app, this would call an external delivery API
    const estimatedTime = Math.floor(Math.random() * 30) + 30; // 30-60 min
    const trackingId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    return {
      trackingId,
      estimatedTime,
      deliveryFee: 5.99,
      trackingUrl: `https://delivery-tracking.example.com/${trackingId}`
    };
  },
  
  getDeliveryStatus: async (trackingId) => {
    // Mock status updates
    const statuses = ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status: randomStatus,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      },
      estimatedArrival: new Date(Date.now() + Math.floor(Math.random() * 30) * 60000)
    };
  }
};

export const createDelivery = async (req, res) => {
  try {
    const { orderId, deliveryAddress } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId,
      customer: req.user.userId,
      status: 'ready'
    });
    
    if (!order) {
      throw new AppError('Order not found or not ready for delivery', 404);
    }
    
    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({ order: orderId });
    if (existingDelivery) {
      throw new AppError('Delivery already created for this order', 400);
    }
    
    // Get customer details
    const customer = await User.findById(req.user.userId);
    
    // Create delivery with delivery service
    const deliveryDetails = await deliveryService.createDelivery(
      order,
      deliveryAddress
    );
    
    // Create delivery record
    const delivery = await Delivery.create({
      order: orderId,
      customer: req.user.userId,
      deliveryAddress,
      status: 'pending',
      estimatedDeliveryTime: new Date(Date.now() + deliveryDetails.estimatedTime * 60000),
      trackingUrl: deliveryDetails.trackingUrl,
      deliveryFee: deliveryDetails.deliveryFee,
      statusHistory: [{
        status: 'pending',
        notes: 'Delivery request created'
      }]
    });
    
    // Update order status
    order.status = 'in-delivery';
    await order.save();
    
    // Send email notification
    await EmailService.sendEmail(
      customer.email,
      'Your Order is Out for Delivery',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your order is on its way!</h2>
          <p>Estimated delivery time: ${new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()}</p>
          <p>Track your delivery: <a href="${delivery.trackingUrl}">Click here</a></p>
        </div>
      `
    );
    
    Logger.info(`Delivery created for order ${orderId}`);
    
    res.status(201).json(delivery);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    Logger.error(`Delivery creation error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findById(id)
      .populate('order')
      .populate('customer');
    
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }
    
    // Check if user is authorized to view this delivery
    if (
      delivery.customer._id.toString() !== req.user.userId && 
      req.user.role !== 'admin' && 
      req.user.role !== 'staff'
    ) {
      throw new AppError('Not authorized to view this delivery', 403);
    }
    
    // Get real-time status from delivery service
    const statusUpdate = await deliveryService.getDeliveryStatus(id);
    
    // Update delivery status if changed
    if (statusUpdate.status !== delivery.status) {
      delivery.status = statusUpdate.status;
      delivery.statusHistory.push({
        status: statusUpdate.status,
        timestamp: new Date(),
        location: statusUpdate.location,
        notes: 'Status updated from delivery service'
      });
      
      if (statusUpdate.status === 'delivered') {
        delivery.actualDeliveryTime = new Date();
        
        // Update order status
        const order = await Order.findById(delivery.order);
        if (order) {
          order.status = 'delivered';
          await order.save();
        }
      }
      
      await delivery.save();
      
      // Notify client about status change
      const io = getIO();
      io.to(`delivery_${id}`).emit('delivery_update', {
        id: delivery._id,
        status: delivery.status,
        location: statusUpdate.location,
        estimatedArrival: statusUpdate.estimatedArrival
      });
    }
    
    res.json({
      delivery,
      currentStatus: {
        status: statusUpdate.status,
        location: statusUpdate.location,
        estimatedArrival: statusUpdate.estimatedArrival
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ customer: req.user.userId })
      .populate('order')
      .sort('-createdAt');
    
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
