import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST place a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !items.length || !totalPrice || !shippingAddress) {
      return res.status(400).json({ message: 'Order items, total price, and shipping address are required.' });
    }

    // Verify stock and fetch fresh product details
    const orderItems = [];
    for (const item of items) {
      const prodId = item.product.id || item.product._id;
      if (!mongoose.Types.ObjectId.isValid(prodId)) {
        return res.status(400).json({ 
          message: `Invalid product ID format for "${item.product.name || 'product'}". Please clear your cart and add items again.` 
        });
      }
      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product.name} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product.id || item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Generate a simple 4-digit numeric OTP for delivery confirmation (e.g. "4820")
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: 'Placed',
      otp
    });

    await order.save();
    
    res.status(201).json({
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order.', error: error.message });
  }
});

// GET all orders of the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('deliveryPartner', 'name phone email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user orders.', error: error.message });
  }
});

// GET single order tracking details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('deliveryPartner', 'name phone email vehicleType');
    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order tracking details.', error: error.message });
  }
});

export default router;
