import Menu from '../models/Menu.js';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';

export const getUpdatedData = async (lastSyncTimestamp) => {
  const timestamp = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
  
  const [menu, inventory] = await Promise.all([
    Menu.find({ updatedAt: { $gt: timestamp } }),
    Inventory.find({ updatedAt: { $gt: timestamp } })
  ]);
  
  return {
    menu,
    inventory
  };
};

export const syncOfflineOrders = async (offlineOrders) => {
  const results = {
    success: [],
    failed: []
  };
  
  for (const order of offlineOrders) {
    try {
      // Remove any client-generated _id to avoid conflicts
      if (order._id && !order._id.match(/^[0-9a-fA-F]{24}$/)) {
        delete order._id;
      }
      
      const newOrder = new Order(order);
      await newOrder.save();
      results.success.push(newOrder);
    } catch (error) {
      results.failed.push({
        order,
        error: error.message
      });
    }
  }
  
  return results;
};
