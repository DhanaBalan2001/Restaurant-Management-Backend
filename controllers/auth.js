import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { username, password, role, email, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'customer', // Default role for new registrations
      email,
      phone,
      address
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT,
        { expiresIn: '24h' }
      );
      res.json({
        token,
        role: user.role,
        userId: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      req.user = decoded;
      next();
    });
  };
};