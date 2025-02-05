import express from 'express';
import { getAllUsers, getAnalytics, getCustomerStats} from '../controllers/admin.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.get('/users', verifyRole(['admin']), getAllUsers);
router.get('/analytics', verifyRole(['admin']), getAnalytics);
router.get('/analytics/customers', verifyRole(['admin']), getCustomerStats);

export default router;