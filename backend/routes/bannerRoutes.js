const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Banner = require('../models/Banner');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Setup storage (Local disk storage exclusively to prevent Cloudinary timeouts or hangs)
const uploadDir = path.join(__dirname, '../uploads/banners');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @desc    Get active banners for public homepage
// @route   GET /api/banners
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const banners = await Banner.find({ is_active: true }).sort({ created_at: -1 });
    res.json(banners);
  } catch (err) {
    next(err);
  }
});

// @desc    Get all banners for admin panel
// @route   GET /api/banners/admin
// @access  Private/Admin
router.get('/admin', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ created_at: -1 });
    res.json(banners);
  } catch (err) {
    next(err);
  }
});

// @desc    Create a banner (Admin)
// @route   POST /api/banners
// @access  Private/Admin
router.post('/', authenticateUser, authorizeRoles('admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const { type, target_link, is_active } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, message: 'Please provide banner type' });
    }

    // Determine imageUrl: local uses /uploads/banners/filename
    const imageUrl = `/uploads/banners/${req.file.filename}`;

    const banner = new Banner({
      image_url: imageUrl,
      type,
      target_link: target_link || '',
      is_active: is_active === undefined ? true : is_active === 'true' || is_active === true
    });

    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (err) {
    next(err);
  }
});

// @desc    Update a banner (Admin)
// @route   PUT /api/banners/:id
// @access  Private/Admin
router.put('/:id', authenticateUser, authorizeRoles('admin'), upload.single('image'), async (req, res, next) => {
  try {
    const { type, target_link, is_active } = req.body;
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (type) banner.type = type;
    if (target_link !== undefined) banner.target_link = target_link;
    if (is_active !== undefined) {
      banner.is_active = is_active === 'true' || is_active === true;
    }

    if (req.file) {
      const imageUrl = `/uploads/banners/${req.file.filename}`;
      banner.image_url = imageUrl;
    }

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a banner (Admin)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
router.delete('/:id', authenticateUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // Delete local file if it was stored locally
    if (banner.image_url && !banner.image_url.startsWith('http')) {
      // Reconstruct absolute path
      const filePath = path.join(__dirname, '..', banner.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
