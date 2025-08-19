const express = require('express');
const crypto = require('crypto');
const https = require('https');

const router = express.Router();

// Helper: call NOWPayments API via HTTPS (no extra deps)
function nowpRequest(path, method, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload || {});
    const options = {
      hostname: 'api.nowpayments.io',
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`NOWPayments ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const Order = require('../models/Order');

// POST /api/pay/crypto/create-invoice
// Body: { amount:number, currency?:'USD'|'INR'|..., meta?:object, orderId?:string }
router.post('/crypto/create-invoice', async (req, res) => {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const publicBase = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
    if (!apiKey) {
      return res.status(500).json({ error: 'NOWPAYMENTS_API_KEY is not set' });
    }

    const { amount, currency = 'USD', meta = {}, orderId: clientOrderId } = req.body || {};
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Build invoice payload
    const orderId = clientOrderId || `inv_${Date.now()}`;
    const payload = {
      price_amount: Number(amount.toFixed(2)),
      price_currency: String(currency).toLowerCase(),
      order_id: orderId,
      success_url: `${publicBase}/payment/success?order_id=${orderId}`,
      cancel_url: `${publicBase}/payment/cancel?order_id=${orderId}`,
      ipn_callback_url: `${process.env.PUBLIC_API_URL || 'http://localhost:4001'}/api/pay/crypto/webhook`,
      is_fixed_rate: false, // allow user to select BTC/USDT on hosted page
      // Restrict to BTC + USDT-TRC20 only
      supported_multi_payments: 'btc,usdttrc20',
      order_description: 'Marketplace order',
      metadata: meta,
    };

    const response = await nowpRequest('/v1/invoice', 'POST', apiKey, payload);
    // If linked to an existing Order, persist invoice id
    if (clientOrderId) {
      try {
        await Order.findByIdAndUpdate(clientOrderId, {
          $set: {
            'payment.method': 'crypto',
            'payment.status': 'processing',
            'payment.invoiceId': response.id || '',
            'payment.externalOrderId': orderId,
            'payment.raw': response,
          },
        });
      } catch {}
    }

    return res.json({
      invoiceId: response.id,
      invoiceUrl: response.invoice_url,
      orderId,
      raw: response,
    });
  } catch (err) {
    console.error('create-invoice error', err);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Webhook verify helper
function verifyNowPaymentsSignature(rawBody, signature, ipnSecret) {
  if (!signature || !ipnSecret) return false;
  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(rawBody, 'utf8');
  const expected = hmac.digest('hex');
  return expected === signature;
}

// For webhook, we need raw body to compute signature
// Raw webhook handler to be mounted directly in index.js BEFORE express.json()
function rawWebhookHandler(req, res) {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || '';
    const signature = req.headers['x-nowpayments-sig'];
    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : '';

    const valid = verifyNowPaymentsSignature(rawBody, signature, ipnSecret);
    if (!valid) {
      return res.status(400).send('invalid signature');
    }

    let payload = {};
    try { payload = JSON.parse(rawBody || '{}'); } catch {}

    // Lookup Order by external order id or direct id
    const { order_id, payment_status, pay_currency, transaction_status, payment_id, price_amount } = payload || {};
    console.log('NOWPayments webhook:', payment_status, order_id);

    // Determine normalized status
    const normalized = (payment_status || transaction_status || 'unpaid').toLowerCase();
    const set = {
      'payment.status': normalized,
      'payment.currency': (pay_currency || '').toString().toLowerCase(),
      'payment.txHash': (payment_id || '').toString(),
      'payment.raw': payload,
    };

    const filter = order_id
      ? { $or: [ { _id: order_id }, { 'payment.externalOrderId': order_id } ] }
      : null;

    if (filter) {
      Order.findOneAndUpdate(filter, { $set: set }, { new: true })
        .then((doc) => {
          if (!doc) return res.status(200).send('ok');
          // Optionally update overall order status on confirmed/finished
          if (normalized === 'confirmed' || normalized === 'finished') {
            doc.payment.status = normalized;
            // Keep existing fulfillment status; payment success recorded
            return doc.save().then(() => res.status(200).send('ok'));
          }
          return res.status(200).send('ok');
        })
        .catch((e) => {
          console.error('webhook order update error', e);
          return res.status(200).send('ok');
        });
      return; // prevent fallthrough
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).send('error');
  }
}

module.exports = { router, rawWebhookHandler };
