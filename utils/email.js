import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPaymentLink = async (reservation) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.customerEmail,
    subject: 'Complete Your Restaurant Reservation Payment',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your Reservation is Confirmed!</h2>
        <p>Here are your reservation details:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li>Name: ${reservation.customerName}</li>
          <li>Email: ${reservation.customerEmail}</li>
          <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
          <li>Time: ${reservation.time}</li>
          <li>Number of Guests: ${reservation.guestCount}</li>
          <li>Table Number: ${reservation.tableNumber}</li>
          <li>Amount: ${calculateAmount(reservation.guestCount)}</li>
        </ul>
        <p>Click the button below to complete your payment:</p>
        <a href="${process.env.CLIENT_URL}payment/${reservation._id}"
            style="background-color: #4CAF50; color: white; padding: 12px 25px;
                   text-decoration: none; border-radius: 5px; display: inline-block;">
          Pay Now
        </a>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

export const sendPaymentConfirmation = async (reservation) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.customerEmail,
    subject: 'Payment Confirmed - Your Restaurant Reservation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Payment Successful!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h3>Your Reservation Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👤 Name: ${reservation.customerName}</li>
            <li>📧 Email: ${reservation.customerEmail}</li>
            <li>📅 Date: ${new Date(reservation.date).toLocaleDateString()}</li>
            <li>⏰ Time: ${reservation.timeSlot}</li>
            <li>👥 Guests: ${reservation.guestCount}</li>
            <li>🪑 Table Number: ${reservation.tableNumber}</li>
          </ul>
        </div>
        <p style="margin-top: 20px;">We look forward to serving you!</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

const calculateAmount = (guestCount) => {
  const basePrice = 500;
  return basePrice * guestCount;
};