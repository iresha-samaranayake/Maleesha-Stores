const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadBill, getBills, updateBillStatus } = require('../controllers/billController');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (requires environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'maleesha-stores-bills',
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Routes
router.route('/').get(authenticateUser, authorizeRoles('admin'), getBills);
router.route('/upload').post(authenticateUser, authorizeRoles('customer'), upload.single('image'), uploadBill);
router.route('/:id').put(authenticateUser, authorizeRoles('admin'), updateBillStatus);

module.exports = router;
