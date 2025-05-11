import express from 'express';
import Reservation from '../models/Reservation.js';
import { createPaymentIntent, sendPaymentConfirmation } from '../services/payment.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for a reservation
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const paymentIntent = await createPaymentIntent(reservation);
    
    reservation.paymentIntentId = paymentIntent.id;
    await reservation.save();

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Handle Stripe webhook events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update reservation payment status
      const reservation = await Reservation.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { 
          paymentStatus: 'paid',
          status: 'confirmed' // Also update the reservation status
        },
        { new: true }
      ).populate('table');
      
      if (reservation) {
        // Send payment confirmation email
        try {
          await sendPaymentConfirmation(reservation);
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      await Reservation.findOneAndUpdate(
        { paymentIntentId: failedPaymentIntent.id },
        { paymentStatus: 'failed' }
      );
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// Get payment status for a reservation
router.get('/status/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json({
      paymentStatus: reservation.paymentStatus,
      reservationStatus: reservation.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
