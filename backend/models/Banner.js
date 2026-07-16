const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: [true, 'Please add a banner image URL']
  },
  type: {
    type: String,
    enum: ['Main Carousel', 'Small Promo', 'Hot Deals'],
    required: [true, 'Please specify the banner type']
  },
  target_link: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Configure virtual field 'id' to map from '_id'
BannerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
BannerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
  }
});

BannerSchema.set('toObject', {
  virtuals: true
});

module.exports = mongoose.model('Banner', BannerSchema);
