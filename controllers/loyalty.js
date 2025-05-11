import Loyalty from '../models/Loyalty.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';

export const getLoyaltyStatus = async (req, res) => {
  try {
    let loyalty = await Loyalty.findOne({ customer: req.user.userId });
    
    if (!loyalty) {
      // Create new loyalty record if not exists
      loyalty = await Loyalty.create({
        customer: req.user.userId,
        points: 0,
        tier: 'bronze'
      });
    }
    
    res.json(loyalty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addLoyaltyPoints = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId,
      customer: req.user.userId,
      status: 'delivered'
    });
    
    if (!order) {
      throw new AppError('Order not found or not eligible for points', 404);
    }
    
    // Calculate points (10% of order total)
    const pointsToAdd = Math.floor(order.totalAmount * 10);
    
    // Update loyalty record
    let loyalty = await Loyalty.findOne({ customer: req.user.userId });
    
    if (!loyalty) {
      loyalty = new Loyalty({
        customer: req.user.userId,
        points: 0
      });
    }
    
    // Check if points were already added for this order
    const alreadyAdded = loyalty.pointsHistory.some(
      history => history.orderId && history.orderId.toString() === orderId
    );
    
    if (alreadyAdded) {
      throw new AppError('Points already added for this order', 400);
    }
    
    // Add points
    loyalty.points += pointsToAdd;
    loyalty.pointsHistory.push({
      points: pointsToAdd,
      reason: 'Order completed',
      orderId: order._id,
      date: new Date()
    });
    
    // Check if user qualifies for rewards
    if (loyalty.points >= 100 && !loyalty.rewards.some(r => !r.isUsed)) {
      // Add a reward for every 100 points
      loyalty.rewards.push({
        type: 'discount',
        value: 10, // 10% discount
        description: '10% off your next order',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }
    
    await loyalty.save();
    
    res.json({
      message: `Added ${pointsToAdd} points to your account`,
      loyalty
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const useReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    const loyalty = await Loyalty.findOne({ customer: req.user.userId });
    
    if (!loyalty) {
      throw new AppError('Loyalty record not found', 404);
    }
    
    const reward = loyalty.rewards.id(rewardId);
    
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }
    
    if (reward.isUsed) {
      throw new AppError('Reward already used', 400);
    }
    
    if (reward.expiryDate < new Date()) {
      throw new AppError('Reward has expired', 400);
    }
    
    // Mark reward as used
    reward.isUsed = true;
    reward.usedDate = new Date();
    
    await loyalty.save();
    
    res.json({
      message: 'Reward successfully used',
      reward
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
