import express from 'express';
import { 
  createDelivery, 
  getDeliveryStatus, 
  getCustomerDeliveries 
} from '../controllers/delivery.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

// Customer routes
router.post('/', verifyRole(['customer']), createDelivery);
router.get('/my-deliveries', verifyRole(['customer']), getCustomerDeliveries);

// Both customer and staff can check delivery status
router.get('/:id', verifyRole(['customer', 'staff', 'admin']), getDeliveryStatus);

export default router;
