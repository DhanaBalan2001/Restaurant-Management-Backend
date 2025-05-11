import express from 'express';
import { getAllUsers, getAnalytics, getCustomerStats, createUser, updateUser, deleteUser} from '../controllers/admin.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.get('/users', verifyRole(['admin']), getAllUsers);
router.get('/analytics', verifyRole(['admin']), getAnalytics);
router.get('/analytics/customers', verifyRole(['admin']), getCustomerStats);
router.post('/users', verifyRole(['admin']), createUser);
router.put('/users/:id', verifyRole(['admin']), updateUser);
router.delete('/users/:id', verifyRole(['admin']), deleteUser);

export default router;