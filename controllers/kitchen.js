import Order from '../models/Order.js';
import { getIO } from '../services/socket.js';

export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'preparing'] }
    })
    .populate('items.menuItem')
    .populate('customer', 'username email')
    .sort('orderDate');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderPreparationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedTime } = req.body;
    
    if (!['preparing', 'ready'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'preparing' or 'ready'" 
      });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    order.status = status;
    if (estimatedTime) {
      order.estimatedCompletionTime = new Date(Date.now() + estimatedTime * 60000);
    }
    
    await order.save();
    
    // Notify clients about the status change
    const io = getIO();
    io.emit('order_status_update', {
      orderId: id,
      status,
      estimatedCompletionTime: order.estimatedCompletionTime
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderQueue = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' })
      .populate('items.menuItem')
      .sort('orderDate');
      
    const preparingOrders = await Order.find({ status: 'preparing' })
      .populate('items.menuItem')
      .sort('orderDate');
      
    const readyOrders = await Order.find({ status: 'ready' })
      .populate('items.menuItem')
      .sort('orderDate');
      
    res.json({
      pending: pendingOrders,
      preparing: preparingOrders,
      ready: readyOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
