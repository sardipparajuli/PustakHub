const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// =====================
// ESEWA PAYMENT
// =====================
router.post('/esewa/initiate', auth, async (req, res) => {
  try {
    const { amount, bookId, bookTitle } = req.body;
    const transactionId = uuidv4();

    // Create signature for eSewa
    const message = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_MERCHANT_ID}`;
    const signature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    const paymentData = {
      amount: amount,
      failure_url: 'http://localhost:3000/payment/failure',
      product_delivery_charge: '0',
      product_service_charge: '0',
      product_code: process.env.ESEWA_MERCHANT_ID,
      signature: signature,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      success_url: `http://localhost:3000/payment/success?bookId=${bookId}`,
      tax_amount: '0',
      total_amount: amount,
      transaction_uuid: transactionId,
    };

    res.json({
      paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      paymentData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
});

// =====================
// KHALTI PAYMENT
// =====================
router.post('/khalti/initiate', auth, async (req, res) => {
  try {
    const { amount, bookId, bookTitle } = req.body;
    const transactionId = uuidv4();

    const payload = {
      return_url: `http://localhost:3000/payment/success?bookId=${bookId}`,
      website_url: 'http://localhost:3000',
      amount: amount * 100, // Khalti uses paisa
      purchase_order_id: transactionId,
      purchase_order_name: bookTitle,
    };

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error) {
    res.status(500).json({ message: 'Khalti payment failed', error: error.message });
  }
});

// =====================
// VERIFY KHALTI PAYMENT
// =====================
router.post('/khalti/verify', auth, async (req, res) => {
  try {
    const { pidx } = req.body;

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'Completed') {
      res.json({ success: true, message: 'Payment verified successfully!' });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// =====================
// BANK TRANSFER
// =====================
router.post('/bank/initiate', auth, async (req, res) => {
  try {
    const { amount, bookId, bookTitle, bankName } = req.body;
    const transactionId = uuidv4();

    // Generate bank transfer details
    const bankDetails = {
      transactionId,
      amount,
      bookTitle,
      bankName,
      accountName: 'PustakHub',
      accountNumber: '0123456789',
      bankBranch: 'Kathmandu',
      message: `Please transfer Rs. ${amount} to complete your purchase of "${bookTitle}". Use transaction ID: ${transactionId} as payment reference.`,
    };

    res.json({ success: true, bankDetails });
  } catch (error) {
    res.status(500).json({ message: 'Bank transfer initiation failed', error: error.message });
  }
});

module.exports = router;