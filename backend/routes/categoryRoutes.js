const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a category
// @route   POST /api/categories
router.post('/', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { name, icon_url, slug } = req.body;

    // Auto-generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = new Category({
      name,
      icon_url,
      slug: categorySlug
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    next(err);
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
router.put('/:id', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { name, icon_url, slug } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name;
    if (icon_url !== undefined) category.icon_url = icon_url;
    if (slug) {
      category.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    } else if (name) {
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
router.delete('/:id', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
