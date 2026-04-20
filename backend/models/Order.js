const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, default: '' },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    size:  String,
    color: String,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  label:      String,
  street:     { type: String, required: true },
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, default: 'India' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:   [orderItemSchema],
    shippingAddress: shippingAddressSchema,

    paymentMethod: {
      type: String,
      enum: ['cod', 'stripe', 'razorpay', 'paypal'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String, default: '' },

    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [
      {
        status:    String,
        timestamp: { type: Date, default: Date.now },
        note:      String,
      },
    ],

    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount:     { type: Number, default: 0 },
    tax:          { type: Number, default: 0 },
    total:        { type: Number, required: true },
    notes:        { type: String, default: '' },

    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
