import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPaymentLink = async (reservation) => {
  const paymentLink = `${process.env.CLIENT_URL}/payment/${reservation._id}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: 'Complete Your Restaurant Reservation Payment',
    html: `
      <h2>Your Reservation is Confirmed!</h2>
      <p>Reservation Details:</p>
      <ul>
        <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
        <li>Time: ${reservation.timeSlot}</li>
        <li>Guests: ${reservation.guestCount}</li>
      </ul>
      <p>Please complete your payment using the link below:</p>
      <a href="${paymentLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Complete Payment
      </a>
    `
  };

  return transporter.sendMail(mailOptions);
};
