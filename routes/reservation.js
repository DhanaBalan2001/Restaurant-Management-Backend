import express from 'express';
import {
    getAvailableTimeSlots,
    createReservation,
    updateReservationStatus,
    getPendingReservations,
    getAllReservations
} from '../controllers/reservation.js';
import Reservation from '../models/Reservation.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

// Public route for checking available time slots
router.get('/available-slots', getAvailableTimeSlots);

// Customer route for creating a reservation
router.post('/create', verifyRole(['customer']), createReservation);

// Admin routes for managing reservations
router.patch('/:id/status', verifyRole(['admin']), updateReservationStatus);
router.get('/pending', verifyRole(['admin']), getPendingReservations);
router.get('/all', verifyRole(['admin']), getAllReservations);

// Payment page route
router.get('/:reservationId', async (req, res) => {
    try {
      const { reservationId } = req.params;
      const reservation = await Reservation.findById(reservationId).populate('table');
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
 });
 

export default router;
