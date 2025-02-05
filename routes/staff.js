import { Router } from 'express';
import { verifyRole } from '../controllers/auth.js';
import { getActiveOrders, updateOrderStatus, searchOrders } from '../controllers/staff.js';

const router = Router();

router.use(verifyRole(['staff']));

router.get('/orders/active', getActiveOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/orders/search', searchOrders);

export default router;