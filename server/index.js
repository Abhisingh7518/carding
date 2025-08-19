const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./lib/db');
const { router: paymentsRouter, rawWebhookHandler } = require('./routes/payments');

// Load env
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Mount NOWPayments webhook BEFORE express.json so we can verify signature using raw body
app.post('/api/pay/crypto/webhook', express.raw({ type: 'application/json' }), rawWebhookHandler);

// JSON parser for the rest of the routes
app.use(express.json());

// DB
connectDB();
// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'cardhavi-api' });
});

app.use('/api/cards', require('./routes/cards'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/pay', paymentsRouter);
app.get('/', (req, res) => {res.send({activeStatus: true,error:false})})

// Start
// At the bottom of the file
const PORT = process.env.PORT || 4001;  // Must be 4001, not 4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
