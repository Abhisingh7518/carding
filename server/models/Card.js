const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rarity: { type: String, enum: ['Legendary', 'Rare', 'Uncommon', 'Common'], required: true },
    rating: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    description: { type: String },
    imageUrl: { type: String },
    // Optional Buy X Get Y promotion
    promoActive: { type: Boolean, default: false },
    promoBuyQty: { type: Number, default: 0 },
    promoGetQty: { type: Number, default: 0 },
    // Optional: Dollar amount to display next to price (admin controlled)
    promoGetAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', CardSchema);
