import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import { notifyKitchen, notifyOrderUpdate } from '../services/socket.js';
import { AppError } from '../utils/errorHandler.js';
import Logger from '../utils/logger.js';

export const createOrder = async (req, res) => {
    try {
      if (req.user.role !== 'customer') {
        throw new AppError("Only customers can place orders", 403);
      }
    
      const { items, specialRequests } = req.body;
    
      // Validate items and calculate total
      let totalAmount = 0;
      const processedItems = [];
    
      for (const item of items) {
        const menuItem = await Menu.findById(item.menuItem);
      
        if (!menuItem) {
          throw new AppError(`Menu item with ID ${item.menuItem} not found`, 404);
        }
      
        if (!menuItem.isAvailable || menuItem.availabilityStatus === 'out-of-stock') {
          throw new AppError(`Menu item ${menuItem.name} is not available`, 400);
        }
      
        let itemPrice = menuItem.price;
        let customizationCost = 0;
      
        // Process customizations if any
        const processedCustomizations = [];
        if (item.customizations && item.customizations.length > 0) {
          for (const customization of item.customizations) {
            const menuCustomization = menuItem.customizationOptions.find(
              opt => opt.name === customization.optionName
            );
          
            if (!menuCustomization) {
              throw new AppError(`Customization option ${customization.optionName} not found for ${menuItem.name}`, 400);
            }
          
            // Validate selected values
            for (const value of customization.selectedValues) {
              const option = menuCustomization.options.find(opt => opt.name === value);
              if (!option) {
                throw new AppError(`Option ${value} not found for customization ${customization.optionName}`, 400);
              }
              customizationCost += option.price;
            }
          
            processedCustomizations.push({
              optionName: customization.optionName,
              selectedValues: customization.selectedValues,
              additionalPrice: customizationCost
            });
          }
        }
      
        const totalItemPrice = (itemPrice + customizationCost) * item.quantity;
        totalAmount += totalItemPrice;
      
        processedItems.push({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: itemPrice,
          customizations: processedCustomizations,
          specialInstructions: item.specialInstructions
        });
      }
    
      const newOrder = await Order.create({
        customer: req.user.userId,
        items: processedItems,
        totalAmount,
        specialRequests,
        status: 'pending'
      });
    
      // Populate menu items for response
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('items.menuItem')
        .populate('customer');
    
      // Notify kitchen about new order
      notifyKitchen(populatedOrder);
    
      Logger.info(`New order created: ${newOrder._id} by user ${req.user.userId}`);
    
      res.status(201).json(populatedOrder);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      Logger.error(`Order creation error: ${error.message}`);
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
            .populate('customer');
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
        const orders = await Order.find({ customer: req.user.userId })
            .populate('items.menuItem')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};