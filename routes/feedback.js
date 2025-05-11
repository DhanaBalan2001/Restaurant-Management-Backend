import express from 'express';
import { 
  createFeedback, 
  getFeedbackByOrder, 
  getCustomerFeedbacks,
  getAllFeedbacks,
  respondToFeedback,
  getFeedbackStats
} from '../controllers/feedback.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

// Customer routes
router.post('/', verifyRole(['customer']), createFeedback);
router.get('/order/:orderId', verifyRole(['customer']), getFeedbackByOrder);
router.get('/my-feedbacks', verifyRole(['customer']), getCustomerFeedbacks);

// Admin routes
router.get('/', verifyRole(['admin']), getAllFeedbacks);
router.post('/:id/respond', verifyRole(['admin']), respondToFeedback);
router.get('/stats', verifyRole(['admin']), getFeedbackStats);

export default router;
