import nodemailer from 'nodemailer';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import { EmailService } from '../services/email.js';

const emailService = new EmailService();

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
    const { 
      table, 
      date, 
      timeSlot, 
      guestCount, 
      customerName, 
      customerEmail, 
      customerPhone,
      specialRequests 
    } = req.body;
    
    // Check if table is available for the selected time slot
    const selectedDate = new Date(date);
    const existingReservation = await Reservation.findOne({
      table,
      date: {
        $gte: new Date(selectedDate.setHours(0,0,0)),
        $lt: new Date(selectedDate.setHours(23,59,59))
      },
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    
    if (existingReservation) {
      return res.status(400).json({ 
        message: 'This table is already reserved for the selected time slot' 
      });
    }
    
    // Create new reservation
    const reservation = new Reservation({
      table,
      date,
      timeSlot,
      guestCount,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      status: 'pending'
    });
    
    // If user is authenticated, associate with customer
    if (req.user && req.user.userId) {
      reservation.customer = req.user.userId;
    }
    
    const savedReservation = await reservation.save();
    
    // Send confirmation email
    try {
      await emailService.sendPaymentLink(savedReservation);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with the reservation process even if email fails
    }
    
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('table')
      .sort('-createdAt');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPendingReservations = async (req, res) => {
  try {
    const pendingReservations = await Reservation.find({ 
      status: 'pending' 
    }).populate('table').sort('-createdAt');
    
    res.json(pendingReservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
