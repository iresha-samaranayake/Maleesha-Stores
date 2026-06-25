const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Get all products (with search and category filter)
// @route   GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category_id, q } = req.query;
    let query = {};

    if (category_id) {
      query.category_id = category_id;
    }

    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category_id')
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a product
// @route   POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const { name, price, unit, category_id, stock, image_url } = req.body;

    const product = new Product({
      name,
      price,
      unit,
      category_id,
      stock,
      image_url
    });

    const savedProduct = await product.save();
    // Populate category_id before returning
    const populatedProduct = await Product.findById(savedProduct._id).populate('category_id');
    res.status(201).json(populatedProduct);
  } catch (err) {
    next(err);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, price, unit, category_id, stock, image_url } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (unit) product.unit = unit;
    if (category_id) product.category_id = category_id;
    if (stock !== undefined) product.stock = stock;
    if (image_url !== undefined) product.image_url = image_url;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate('category_id');
    res.json(populatedProduct);
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
