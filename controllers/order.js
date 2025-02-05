import Order from '../models/Order.js';
import { notifyKitchen, notifyOrderUpdate } from '../services/socket.js';

export const createOrder = async (req, res) => {
  try {
      if (req.user.role !== 'customer') {
          return res.status(403).json({ message: "Only customers can place orders" });
      }
      const newOrder = await Order.create(req.body);
      
      // Notify kitchen about new order
      notifyKitchen(newOrder);
      
      res.status(201).json(newOrder);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('customer')
        .populate('items.menuItem')
        .sort('-createdAt');
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
export const getOrderById = async (req, res) => {
  try {
      const order = await Order.findById(req.params.id)
          .populate('items.menuItem')
          .populate('user');
      if (!order) {
          return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Validate order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('items.menuItem');

        // Notify kitchen about status change
        // notifyOrderUpdate(updatedOrder._id, status);

        res.json(updatedOrder);
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ 
            message: "Error updating order status",
            error: error.message 
        });
    }
};

export const getUserOrders = async (req, res) => {
  try {
      const orders = await Order.find({ user: req.user.userId })
          .populate('items.menuItem')
          .sort('-createdAt');
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};