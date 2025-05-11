import express from 'express';
import { 
  getActiveOrders, 
  updateOrderPreparationStatus, 
  getOrderQueue 
} from '../controllers/kitchen.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.use(verifyRole(['staff', 'admin']));

router.get('/active-orders', getActiveOrders);
router.put('/orders/:id/status', updateOrderPreparationStatus);
router.get('/queue', getOrderQueue);

export default router;
