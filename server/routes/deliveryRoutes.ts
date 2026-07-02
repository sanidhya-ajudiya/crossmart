import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { authenticate, isDelivery, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'crossmart-secret-key-123';

// POST Login for delivery partner
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const partner = await DeliveryPartner.findOne({ email });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid email address or password.' });
    }

    if (!partner.isActive) {
      return res.status(403).json({ message: 'Your partner account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email address or password.' });
    }

    const token = jwt.sign({ id: partner._id, role: 'delivery' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        vehicleType: partner.vehicleType,
        role: 'delivery'
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during delivery partner login.', error: error.message });
  }
});

// Apply authentication and role check to subsequent delivery routes
router.use(authenticate);
router.use(isDelivery);

// GET orders assigned to the logged-in delivery partner
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { tab } = req.query; // 'active' or 'completed'
    const query: any = { deliveryPartner: req.user._id };

    if (tab === 'completed') {
      query.status = { $in: ['Delivered', 'Cancelled'] };
    } else {
      // active
      query.status = { $in: ['Assigned', 'Packed', 'Out for Delivery'] };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Format fields to match DeliveryOrder type in client dashboard
    const formattedOrders = orders.map((order: any) => {
      // Split the shipping address if it contains commas, or map to a default shape
      const parts = order.shippingAddress.split(',');
      const street = parts[0]?.trim() || order.shippingAddress;
      const city = parts[parts.length - 3]?.trim() || 'Bengaluru';
      const state = parts[parts.length - 2]?.trim() || 'KA';
      const zip = parts[parts.length - 1]?.trim() || '560001';

      return {
        _id: order._id,
        user: {
          name: (order.user as any)?.name || 'Customer',
          email: (order.user as any)?.email || '',
          phone: (order.user as any)?.phone || '+91 99999 99999'
        },
        items: order.items.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity
        })),
        total: order.totalPrice,
        status: order.status,
        shippingAddress: {
          address: street,
          city: city,
          state: state,
          zip: zip
        },
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      };
    });

    res.json(formattedOrders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching assigned orders.', error: error.message });
  }
});

// PUT update status of an assigned order (e.g. 'Out for Delivery')
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Assigned order not found.' });
    }

    if (status !== 'Out for Delivery' && status !== 'Assigned' && status !== 'Packed') {
      return res.status(400).json({ message: 'Invalid status update for this endpoint.' });
    }

    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated successfully.', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order status.', error: error.message });
  }
});

// PUT verify OTP and mark order as Delivered
router.put('/orders/:id/complete', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: 'Verification OTP is required.' });
    }

    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Assigned order not found.' });
    }

    if (order.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification OTP code. Access denied.' });
    }

    order.status = 'Delivered';
    order.deliveryDate = new Date();
    await order.save();

    res.json({ message: 'Delivery completed successfully.', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error completing delivery.', error: error.message });
  }
});

// PUT cancel/reject order delivery assignment
router.put('/orders/:id/cancel', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { reason } = req.body; // cancellation reason (optional)
    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Assigned order not found.' });
    }

    order.status = 'Cancelled';
    // We could log reason if needed
    await order.save();

    res.json({ message: 'Delivery assignment cancelled successfully.', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error cancelling delivery assignment.', error: error.message });
  }
});

export default router;
