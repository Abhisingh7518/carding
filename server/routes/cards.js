const router = require('express').Router();
const Card = require('../models/Card');

// Seed helper used if DB is empty
async function ensureSeed() {
  const count = await Card.countDocuments();
  if (count > 0) return;
  await Card.insertMany([
    { name: 'Lightning Dragon', category: 'Mythic', price: 149.99, rarity: 'Legendary', rating: 4.8, inStock: true },
    { name: 'Shadow Assassin', category: 'Rare', price: 79.99, rarity: 'Rare', rating: 4.6, inStock: true },
    { name: 'Crystal Phoenix', category: 'Mythic', price: 299.99, rarity: 'Legendary', rating: 5.0, inStock: true },
    { name: 'Storm Wizard', category: 'Common', price: 29.99, rarity: 'Common', rating: 4.2, inStock: true },
    { name: 'Ancient Golem', category: 'Rare', price: 99.99, rarity: 'Rare', rating: 4.5, inStock: false },
    { name: 'Mystic Fairy', category: 'Uncommon', price: 49.99, rarity: 'Uncommon', rating: 4.3, inStock: true },
    { name: 'Fire Elemental', category: 'Rare', price: 89.99, rarity: 'Rare', rating: 4.7, inStock: true },
    { name: 'Ice Queen', category: 'Mythic', price: 199.99, rarity: 'Legendary', rating: 4.9, inStock: true },
  ]);
}

// GET /api/cards
router.get('/', async (req, res) => {
  try {
    await ensureSeed();
    const cards = await Card.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error('GET /cards error:', err.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// POST /api/cards - create a new card (admin action)
router.post('/', async (req, res) => {
  try {
    const { name, category, price, rarity, rating, inStock, imageUrl, stock, description, promoActive, promoBuyQty, promoGetQty, promoGetAmount } = req.body || {};
    if (!name || !category || typeof price !== 'number' || !rarity) {
      return res.status(400).json({ error: 'Missing required fields (name, category, price, rarity)' });
    }
    if (!['Legendary', 'Rare', 'Uncommon', 'Common'].includes(rarity)) {
      return res.status(400).json({ error: 'Invalid rarity' });
    }
    const card = await Card.create({
      name,
      category,
      price,
      rarity,
      rating: typeof rating === 'number' ? rating : 0,
      stock: typeof stock === 'number' ? stock : 0,
      inStock: typeof inStock === 'boolean' ? inStock : ((typeof stock === 'number' ? stock : 0) > 0),
      description: typeof description === 'string' ? description : undefined,
      imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      promoActive: typeof promoActive === 'boolean' ? promoActive : false,
      promoBuyQty: typeof promoBuyQty === 'number' ? promoBuyQty : 0,
      promoGetQty: typeof promoGetQty === 'number' ? promoGetQty : 0,
      promoGetAmount: typeof promoGetAmount === 'number' ? promoGetAmount : 0,
    });
    return res.status(201).json(card);
  } catch (err) {
    console.error('POST /cards error:', err.message);
    return res.status(500).json({ error: 'Failed to create card' });
  }
});

// PUT /api/cards/:id - update a card
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, rarity, rating, inStock, imageUrl, stock, description, promoActive, promoBuyQty, promoGetQty, promoGetAmount } = req.body || {};
    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof category === 'string') update.category = category;
    if (typeof price === 'number') update.price = price;
    if (typeof rarity === 'string') {
      if (!['Legendary', 'Rare', 'Uncommon', 'Common'].includes(rarity)) {
        return res.status(400).json({ error: 'Invalid rarity' });
      }
      update.rarity = rarity;
    }
    if (typeof rating === 'number') update.rating = rating;
    if (typeof stock === 'number') update.stock = stock;
    if (typeof inStock === 'boolean') update.inStock = inStock;
    if (typeof description === 'string') update.description = description;
    if (typeof imageUrl === 'string') update.imageUrl = imageUrl;
    if (typeof promoActive === 'boolean') update.promoActive = promoActive;
    if (typeof promoBuyQty === 'number') update.promoBuyQty = promoBuyQty;
    if (typeof promoGetQty === 'number') update.promoGetQty = promoGetQty;
    if (typeof promoGetAmount === 'number') update.promoGetAmount = promoGetAmount;

    // If stock provided but inStock not explicitly set, derive from stock
    if (typeof stock === 'number' && typeof inStock !== 'boolean') {
      update.inStock = stock > 0;
    }

    const updated = await Card.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Card not found' });
    return res.json(updated);
  } catch (err) {
    console.error('PUT /cards/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to update card' });
  }
});

// DELETE /api/cards/:id - delete a card
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Card.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Card not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /cards/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to delete card' });
  }
});

module.exports = router;
