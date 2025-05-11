import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Calculate amount based on guest count
export const calculateAmount = (guestCount) => {
  // Base price per guest (in cents for Stripe)
  const basePrice = 1500; // $15.00 per guest
  return basePrice * guestCount;
};

// Create a payment intent with Stripe
export const createPaymentIntent = async (reservation) => {
  const amount = calculateAmount(reservation.guestCount);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      reservationId: reservation._id.toString(),
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      date: reservation.date,
      timeSlot: reservation.timeSlot,
      guestCount: reservation.guestCount.toString()
    }
  });
  
  return paymentIntent;
};

export const sendPaymentLink = async (reservation) => {
  const paymentLink = `${process.env.CLIENT_URL}/payment/${reservation._id}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.customerEmail,
    subject: 'Complete Your Restaurant Reservation Payment',
    html: `
      <h2>Your Reservation is Confirmed!</h2>
      <p>Reservation Details:</p>
      <ul>
        <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
        <li>Time: ${reservation.timeSlot}</li>
        <li>Guests: ${reservation.guestCount}</li>
        <li>Amount: $${(calculateAmount(reservation.guestCount) / 100).toFixed(2)}</li>
      </ul>
      <p>Please complete your payment using the link below:</p>
      <a href="${paymentLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Complete Payment
      </a>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendPaymentConfirmation = async (reservation) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.customerEmail,
    subject: 'Payment Confirmation - Restaurant Reservation',
    html: `
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment. Your reservation is now fully confirmed.</p>
      <p>Reservation Details:</p>
      <ul>
        <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
        <li>Time: ${reservation.timeSlot}</li>
        <li>Guests: ${reservation.guestCount}</li>
        <li>Table: ${reservation.table?.tableNumber || 'TBD'}</li>
        <li>Amount Paid: $${(calculateAmount(reservation.guestCount) / 100).toFixed(2)}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `
  };

  return transporter.sendMail(mailOptions);
};
