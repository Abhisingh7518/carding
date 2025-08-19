const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    address: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Payment fields
    payment: {
      method: { type: String, enum: ['cod', 'card', 'crypto'], default: 'crypto' },
      status: { type: String, enum: ['unpaid', 'processing', 'confirmed', 'finished', 'failed', 'expired'], default: 'unpaid' },
      currency: { type: String, default: '' }, // e.g., btc, usdttrc20
      invoiceId: { type: String, default: '' },
      externalOrderId: { type: String, default: '' }, // mirrors payload.order_id when using providers
      txHash: { type: String, default: '' },
      raw: { type: Object, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
