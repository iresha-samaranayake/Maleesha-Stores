const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  customerDetails: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required']
    },
    email: {
      type: String
    },
    deliveryAddress: {
      type: String,
      required: function() {
        return this.customerDetails.pickupType === 'delivery';
      }
    },
    pickupType: {
      type: String,
      required: true,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Pick up and pay', 'Pay Online', 'Pay On Delivery'],
    default: 'Pick up and pay'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
