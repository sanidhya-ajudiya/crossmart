import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { authenticate, isAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(isAdmin);

// GET admin dashboard stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      outOfStock,
      recentOrders
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error calculating dashboard statistics.', error: error.message });
  }
});

// GET all orders in the system
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving orders.', error: error.message });
  }
});

// PUT update order status manually
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status field is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order status.', error: error.message });
  }
});

// PUT assign a delivery partner
router.put('/orders/:id/assign', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }

    order.deliveryPartner = partner._id;
    order.status = 'Assigned';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('deliveryPartner', 'name phone email');

    res.json(populatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning delivery partner.', error: error.message });
  }
});

// GET all delivery partners
router.get('/partners', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving delivery partners.', error: error.message });
  }
});

// POST register a new delivery partner
router.post('/partners', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, email, password, phone, vehicleType, isActive } = req.body;
    if (!name || !email || !password || !phone || !vehicleType) {
      return res.status(400).json({ message: 'Missing required partner fields.' });
    }

    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'A delivery partner with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = new DeliveryPartner({
      name,
      email,
      password: hashedPassword,
      phone,
      vehicleType,
      isActive: isActive === undefined ? true : !!isActive
    });

    await partner.save();
    res.status(201).json(partner);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering delivery partner.', error: error.message });
  }
});

// PUT update delivery partner details
router.put('/partners/:id', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, email, password, phone, vehicleType, isActive } = req.body;
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }

    if (name !== undefined) partner.name = name;
    if (email !== undefined) partner.email = email;
    if (phone !== undefined) partner.phone = phone;
    if (vehicleType !== undefined) partner.vehicleType = vehicleType;
    if (isActive !== undefined) partner.isActive = !!isActive;
    
    if (password) {
      partner.password = await bcrypt.hash(password, 10);
    }

    await partner.save();
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating delivery partner details.', error: error.message });
  }
});

// DELETE a delivery partner
router.delete('/partners/:id', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }
    res.json({ message: 'Delivery partner deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting delivery partner.', error: error.message });
  }
});

export default router;
