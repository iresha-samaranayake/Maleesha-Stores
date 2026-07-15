const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateUser, authorizeRoles, optionalAuthenticateUser } = require('../middleware/authMiddleware');

// @desc    Get current user's orders (matched by phone stored in user profile)
// @route   GET /api/orders/myorders
router.get('/myorders', authenticateUser, authorizeRoles('customer'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json([]);
    }
    const query = { user: user._id };
    if (user.phone) {
      query.$or = [ { user: user._id }, { 'customerDetails.phone': user.phone } ];
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(10);
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
router.post('/', optionalAuthenticateUser, async (req, res, next) => {
  try {
    const { items, customerDetails, totalPrice, paymentMethod, createAccount, password } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Handle guest account creation
    let newUser = null;
    let userToken = null;

    if (createAccount && !req.user) {
      const User = require('../models/User');
      if (!password) {
        return res.status(400).json({ success: false, message: 'Please provide a password to create an account' });
      }
      const email = customerDetails.email;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email to create an account' });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please log in or use a different email address.' });
      }

      newUser = await User.create({
        name: customerDetails.name,
        email,
        password,
        phone: customerDetails.phone,
        address: customerDetails.pickupType === 'delivery' ? customerDetails.deliveryAddress : '',
        role: 'customer'
      });

      const jwt = require('jsonwebtoken');
      userToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
      });
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

    let orderUserId = null;
    if (req.user) {
      orderUserId = req.user._id;
    } else if (newUser) {
      orderUserId = newUser._id;
    } else if (customerDetails && customerDetails.email) {
      const User = require('../models/User');
      const matchedUser = await User.findOne({ email: customerDetails.email.toLowerCase() });
      if (matchedUser) {
        orderUserId = matchedUser._id;
      }
    }

    const order = new Order({
      items,
      customerDetails,
      totalPrice,
      paymentMethod: paymentMethod || 'Pick up and pay',
      paymentStatus: 'Pending',
      user: orderUserId
    });

    const savedOrder = await order.save();

    const responseData = {
      _id: savedOrder._id,
      items: savedOrder.items,
      customerDetails: savedOrder.customerDetails,
      totalPrice: savedOrder.totalPrice,
      status: savedOrder.status,
      paymentMethod: savedOrder.paymentMethod,
      paymentStatus: savedOrder.paymentStatus,
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt
    };

    if (newUser && userToken) {
      responseData.user = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        token: userToken
      };
    }

    res.status(201).json(responseData);
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

// @desc    Update order payment status to Paid
// @route   PUT /api/orders/:id/pay
router.put('/:id/pay', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.paymentStatus = 'Paid';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
