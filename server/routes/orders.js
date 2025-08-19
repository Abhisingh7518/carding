const router = require('express').Router();
const Order = require('../models/Order');

// Create order
router.post('/', async (req, res) => {
  try {
    const { user, items, total, address } = req.body || {};
    if (!user || !items || !Array.isArray(items) || typeof total !== 'number') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const order = await Order.create({ user, items, total, address: address || '', status: 'pending' });
    return res.status(201).json(order);
  } catch (err) {
    console.error('POST /orders error:', err.message);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// List all orders (admin only)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const orders = await Order.find({ 'user.id': userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error('GET /orders/user/:userId error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['pending', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json(updated);
  } catch (err) {
    console.error('PATCH /orders/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
