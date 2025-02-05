import express from 'express';
import Reservation from '../models/Reservation.js';

const router = express.Router();

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
    res.status(500).json({ message: error.message });
  }
});

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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await Reservation.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'paid' }
    );
  }

  res.json({ received: true });
});

export default router;
