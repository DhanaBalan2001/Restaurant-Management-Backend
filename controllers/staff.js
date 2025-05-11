import Order from '../models/Order.js';
import Table from '../models/Table.js';

export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'preparing', 'ready'] }
    })
    .populate('customer', 'username email')
    .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'username email');
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (date) {
      query.createdAt = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      };
    }

    const orders = await Order.find(query)
      .populate('customer', 'username email')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    // Get order statistics
    const activeOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'preparing'] } 
    });
    
    const pendingOrders = await Order.countDocuments({ 
      status: 'pending' 
    });
    
    const completedOrders = await Order.countDocuments({ 
      status: 'completed' 
    });

    // Get table statistics
    const occupiedTables = await Table.countDocuments({ 
      status: 'occupied' 
    });
    
    const availableTables = await Table.countDocuments({ 
      status: 'available' 
    });

    // Return combined stats
    res.json({
      activeOrders,
      pendingOrders,
      completedOrders,
      occupiedTables,
      availableTables
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

