const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// @desc    Get current user's orders (matched by phone stored in user profile)
// @route   GET /api/orders/myorders
router.get('/myorders', authenticateUser, authorizeRoles('customer'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user || !user.phone) {
      return res.json([]);
    }
    const orders = await Order.find({ 'customerDetails.phone': user.phone }).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// @desc    Get all orders
// @route   GET /api/orders
router.get('/', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new order
// @route   POST /api/orders
router.post('/', authenticateUser, authorizeRoles('customer'), async (req, res, next) => {
  try {
    const { items, customerDetails, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Optional: Validate product stock and decrement stock
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      items,
      customerDetails,
      totalPrice
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
router.put('/:id/status', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
