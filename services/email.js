import nodemailer from 'nodemailer';
import dotenv from'dotenv'

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    return this.transporter.sendMail(mailOptions);
  }

  calculateAmount(guestCount) {
    // Simple calculation - you can adjust based on your business logic
    const baseAmount = 10; // Base reservation fee
    return `$${baseAmount * guestCount}`;
  }

  async sendPaymentLink(reservation) {
    const subject = 'Complete Your Restaurant Reservation Payment';
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your Reservation is Confirmed!</h2>
        <p>Here are your reservation details:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li>Name: ${reservation.customerName}</li>
          <li>Email: ${reservation.customerEmail}</li>
          <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
          <li>Time: ${reservation.timeSlot}</li>
          <li>Number of Guests: ${reservation.guestCount}</li>
          <li>Table Number: ${reservation.table?.tableNumber || 'TBD'}</li>
          <li>Amount: ${this.calculateAmount(reservation.guestCount)}</li>
        </ul>
        <p>Click the button below to complete your payment:</p>
        <a href="${process.env.CLIENT_URL}/payment/${reservation._id}"
            style="background-color: #4CAF50; color: white; padding: 12px 25px;
                   text-decoration: none; border-radius: 5px; display: inline-block;">
          Pay Now
        </a>
      </div>
    `;

    return this.sendEmail(reservation.customerEmail, subject, html);
  }

  async sendPaymentConfirmation(reservation) {
    const subject = 'Payment Confirmed - Your Restaurant Reservation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Payment Successful!</h2>
        <p>Your reservation payment has been confirmed.</p>
        <p>We look forward to seeing you on ${new Date(reservation.date).toLocaleDateString()} at ${reservation.timeSlot}!</p>
      </div>
    `;
    
    return this.sendEmail(reservation.customerEmail, subject, html);
  }
}

export { EmailService };
