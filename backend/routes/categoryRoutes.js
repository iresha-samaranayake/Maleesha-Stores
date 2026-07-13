const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Category = require('../models/Category');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Setup storage
const uploadDir = path.join(__dirname, '../uploads/categories');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a category
// @route   POST /api/categories
router.post('/', authenticateUser, authorizeRoles('admin'), upload.single('image'), async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    // Auto-generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    const category = new Category({
      name,
      image_url: imageUrl,
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
router.put('/:id', authenticateUser, authorizeRoles('admin'), upload.single('image'), async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name;
    if (slug) {
      category.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    } else if (name) {
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (req.file) {
      // Delete old file if exists and is local
      if (category.image_url && !category.image_url.startsWith('http')) {
        const filePath = path.join(__dirname, '..', category.image_url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('Failed to delete old category image:', e);
          }
        }
      }
      category.image_url = `/uploads/categories/${req.file.filename}`;
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

    // Delete image file if exists and is local
    if (category.image_url && !category.image_url.startsWith('http')) {
      const filePath = path.join(__dirname, '..', category.image_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete category image on delete:', e);
        }
      }
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
