import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT || 'test-secret', { expiresIn: '1h' });
};
