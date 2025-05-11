import express from 'express';
import { 
    createOrder, 
    getAllOrders, 
    getOrderById, 
    updateOrderStatus, 
    getUserOrders 
} from '../controllers/order.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/', verifyRole(['customer']), createOrder);
router.get('/', verifyRole(['admin','staff']), getAllOrders);
router.get('/user', verifyRole(['admin','staff','customer']), getUserOrders);
router.get('/:id', verifyRole(['admin', 'staff','customer']), getOrderById);
router.put('/:id/status', verifyRole(['admin', 'staff']), updateOrderStatus);

export default router;
