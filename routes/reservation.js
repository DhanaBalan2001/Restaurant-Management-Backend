import express from 'express';
import {
    getAvailableTimeSlots,
    createReservation,
    updateReservationStatus,
    getPendingReservations,
    getAllReservations
} from '../controllers/reservation.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/create', verifyRole(['customer']), createReservation);
router.get('/available-slots', getAvailableTimeSlots);
router.patch('/:id/status', verifyRole(['admin']), updateReservationStatus);
router.get('/pending', verifyRole(['admin']), getPendingReservations);
router.get('/all', verifyRole(['admin']), getAllReservations);
router.get('/:reservationId', async (req, res) => {
   const { reservationId } = req.params;
   // Integrate with your payment gateway (e.g., Stripe)
   res.render('payment', { reservationId });
});

export default router;