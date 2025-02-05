import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const TIME_SLOTS = [
  '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
];

export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, guestCount } = req.query;
    const selectedDate = new Date(date);
    
    // Find tables that can accommodate the guest count
    const tables = await Table.find({
      capacity: { $gte: guestCount },
      isActive: true
    });

    // Get existing reservations for the selected date
    const existingReservations = await Reservation.find({
      date: {
        $gte: new Date(selectedDate.setHours(0,0,0)),
        $lt: new Date(selectedDate.setHours(23,59,59))
      },
      status: { $ne: 'cancelled' }
    }).populate('table');

    // Create availability map for each time slot
    const availability = TIME_SLOTS.map(timeSlot => {
      const bookedTablesIds = existingReservations
        .filter(res => res.timeSlot === timeSlot)
        .map(res => res.table._id.toString());

      const availableTables = tables.filter(table => 
        !bookedTablesIds.includes(table._id.toString())
      );

      return {
        timeSlot,
        availableTables,
        hasAvailability: availableTables.length > 0
      };
    });

    res.json({
      date: selectedDate,
      guestCount,
      availability: availability.filter(slot => slot.hasAvailability)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { table, date, timeSlot, guestCount, customerName, customerEmail, customerPhone } = req.body;

    const newReservation = await Reservation.create({
      table,
      date,
      timeSlot,
      guestCount,
      customerName,
      customerEmail,
      customerPhone,
      status: 'pending'
    });

    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Log email details for verification
    console.log('Sending email to:', reservation.customerEmail);

    reservation.status = status;
    await reservation.save();

    if (status === 'confirmed') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: reservation.customerEmail,
        subject: 'Restaurant Reservation Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Your Table is Reserved!</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
              <h3>Reservation Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📅 Date: ${new Date(reservation.date).toLocaleDateString()}</li>
                <li>⏰ Time: ${reservation.timeSlot}</li>
                <li>👥 Guests: ${reservation.guestCount}</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/payment/${reservation._id}"
                  style="background-color: #4CAF50; color: white; padding: 12px 25px;
                         text-decoration: none; border-radius: 5px; display: inline-block;">
                Complete Payment
              </a>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    }

    res.json({
      message: `Reservation ${status} and notification sent successfully`,
      reservation
    });
  } catch (error) {
    console.log('Email error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPendingReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      status: 'pending'
    }).populate('table');
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('table')
      .sort({ date: -1 });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};