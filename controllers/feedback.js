import Feedback from '../models/Feedback.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/errorHandler.js';
import Logger from '../utils/logger.js';

export const createFeedback = async (req, res) => {
  try {
    const { orderId, rating, foodQuality, service, ambience, valueForMoney, comment } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId,
      customer: req.user.userId,
      status: 'delivered'
    });
    
    if (!order) {
      throw new AppError('Order not found or not eligible for feedback', 404);
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ 
      order: orderId,
      customer: req.user.userId
    });
    
    if (existingFeedback) {
      throw new AppError('Feedback already submitted for this order', 400);
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      customer: req.user.userId,
      order: orderId,
      rating,
      foodQuality,
      service,
      ambience,
      valueForMoney,
      comment,
      status: 'pending'
    });
    
    Logger.info(`New feedback submitted for order ${orderId}`);
    
    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    Logger.error(`Feedback creation error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getFeedbackByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const feedback = await Feedback.findOne({ 
      order: orderId,
      customer: req.user.userId
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'No feedback found for this order' });
    }
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ customer: req.user.userId })
      .populate('order')
      .sort('-createdAt');
    
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const { status, minRating } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }
    
    const feedbacks = await Feedback.find(query)
      .populate('customer', 'username email')
      .populate('order')
      .sort('-createdAt');
    
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, status } = req.body;
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }
    
    feedback.adminResponse = {
      comment,
      respondedAt: new Date(),
      respondedBy: req.user.userId
    };
    
    if (status) {
      feedback.status = status;
    }
    
    await feedback.save();
    
    Logger.info(`Admin response added to feedback ${id}`);
    
    res.json(feedback);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          averageFoodQuality: { $avg: '$foodQuality' },
          averageService: { $avg: '$service' },
          averageAmbience: { $avg: '$ambience' },
          averageValueForMoney: { $avg: '$valueForMoney' },
          totalFeedbacks: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ['$averageRating', 1] },
          averageFoodQuality: { $round: ['$averageFoodQuality', 1] },
          averageService: { $round: ['$averageService', 1] },
          averageAmbience: { $round: ['$averageAmbience', 1] },
          averageValueForMoney: { $round: ['$averageValueForMoney', 1] },
          totalFeedbacks: 1,
          ratingDistribution: {
            '5': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 5] } } } },
            '4': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 4] } } } },
            '3': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 3] } } } },
            '2': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 2] } } } },
            '1': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 1] } } } }
          }
        }
      }
    ]);
    
    res.json(stats[0] || {
      averageRating: 0,
      totalFeedbacks: 0,
      ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
