import { Router } from 'express';
import { verifyRole } from '../controllers/auth.js';
import { getMenu, createOrder, getOrderHistory, createReservation, getReservations } from '../controllers/customer.js';

const router = Router();

// Public routes
router.get('/menu', getMenu);

// Protected routes
router.use(verifyRole(['customer']));
router.post('/orders', createOrder);
router.get('/orders/history', getOrderHistory);
router.post('/reservations', createReservation);
router.get('/reservations', getReservations);

export default router;