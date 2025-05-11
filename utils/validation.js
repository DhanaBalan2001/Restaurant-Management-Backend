import Joi from 'joi';

export const menuSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().required().min(10).max(500),
  price: Joi.number().required().min(0),
  category: Joi.string().required().valid('appetizers', 'drinks', 'maincourse', 'desserts'),
  isAvailable: Joi.boolean().default(true),
  availabilityStatus: Joi.string().valid('in-stock', 'out-of-stock').default('in-stock'),
  image: Joi.string().uri().allow('', null)
});

export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      menuItem: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
      quantity: Joi.number().required().min(1),
      price: Joi.number().required().min(0)
    })
  ).min(1).required(),
  totalAmount: Joi.number().required().min(0)
});

export const reservationSchema = Joi.object({
  table: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  date: Joi.date().required().min('now'),
  timeSlot: Joi.string().required(),
  guestCount: Joi.number().required().min(1),
  customerName: Joi.string().required().min(2).max(100),
  customerEmail: Joi.string().required().email(),
  customerPhone: Joi.string().required().pattern(/^\+?[0-9]{10,15}$/)
});

export const userSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('admin', 'staff', 'customer').default('customer'),
  phoneNumber: Joi.string().pattern(/^\+?[0-9]{10,15}$/).allow('', null)
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message,
        error: 'Validation Error' 
      });
    }
    next();
  };
};
