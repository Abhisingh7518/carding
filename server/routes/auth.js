const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    return res.status(201).json({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    console.error('POST /signup error:', err.message);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    return res.json({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    console.error('POST /login error:', err.message);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
