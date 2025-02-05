import Menu from '../models/Menu.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';

export const getMenu = async (req, res) => {
  try {
    const menus = await Menu.find({ isAvailable: true });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const order = new Order({
      customer: req.user.userId,
      items,
      status: 'pending',
      totalAmount: req.body.totalAmount
    });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.userId })
      .populate('items.menuItem')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    const reservation = new Reservation({
      customer: req.user.userId,
      date: req.body.date,
      time: req.body.time,
      guests: req.body.guests,
      status: 'pending'
    });
    const savedReservation = await reservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.userId })
      .sort('-date');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};