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

// Routes
router.route('/').get(getBills);
router.route('/upload').post(upload.single('image'), uploadBill);
router.route('/:id').put(updateBillStatus);

module.exports = router;
