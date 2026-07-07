const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone number is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Bill image is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', BillSchema);
