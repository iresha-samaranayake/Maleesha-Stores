const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateUser } = require('../middleware/authMiddleware');

// @desc    Get user's cart
// @route   GET /api/cart
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart.items);
  } catch (err) {
    next(err);
  }
});

// @desc    Save/Sync user's cart
// @route   POST /api/cart
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { items } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }
    cart.items = items;
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    next(err);
  }
});

// @desc    Merge guest cart into user's cart
// @route   POST /api/cart/merge
router.post('/merge', authenticateUser, async (req, res, next) => {
  try {
    const { guestItems } = req.body;
    if (!guestItems || guestItems.length === 0) {
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }
      return res.json(cart.items);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Merge logic: if item exists, add quantities, else push new item
    guestItems.forEach((guestItem) => {
      const existing = cart.items.find(item => item.product_id.toString() === guestItem.product_id.toString());
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    });

    await cart.save();
    res.json(cart.items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
