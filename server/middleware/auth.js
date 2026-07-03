import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

const JWT_SECRET = process.env.JWT_SECRET || 'crossmart-secret-key-123';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No authentication token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role === 'delivery') {
      const partner = await DeliveryPartner.findById(decoded.id);
      if (!partner) {
        res.status(401).json({ message: 'Authentication failed. Delivery partner not found.' });
        return;
      }
      req.user = partner.toObject();
      req.user.role = 'delivery';
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Authentication failed. User not found.' });
        return;
      }
      req.user = user.toObject();
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Administrative privileges required.' });
    return;
  }
  next();
};

export const isDelivery = (req, res, next) => {
  if (!req.user || req.user.role !== 'delivery') {
    res.status(403).json({ message: 'Access denied. Delivery partner privileges required.' });
    return;
  }
  next();
};
