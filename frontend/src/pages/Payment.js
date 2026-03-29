import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, Divider, Alert, Radio,
  RadioGroup, FormControlLabel, FormControl
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  const handlePayment = async () => {
    if (!book) {
      setError('Book details not found!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');

      if (paymentMethod === 'esewa') {
        const res = await axios.post(
          'http://localhost:5000/api/payment/esewa/initiate',
          { amount: book.price, bookId: book._id, bookTitle: book.title },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Create and submit eSewa form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.data.paymentUrl;
        Object.entries(res.data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();

      } else if (paymentMethod === 'khalti') {
        const res = await axios.post(
          'http://localhost:5000/api/payment/khalti/initiate',
          { amount: book.price, bookId: book._id, bookTitle: book.title },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.href = res.data.paymentUrl;

      } else if (paymentMethod === 'bank') {
        const res = await axios.post(
          'http://localhost:5000/api/payment/bank/initiate',
          { amount: book.price, bookId: book._id, bookTitle: book.title, bankName: 'Nepal Bank' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBankDetails(res.data.bankDetails);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed!');
    }
    setLoading(false);
  };

  if (!book) return (
    <Container sx={{ mt: 5, textAlign: 'center' }}>
      <Typography>Book details not found!</Typography>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
          💳 Complete Payment
        </Typography>

        {/* Book Summary */}
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">{book.title}</Typography>
          <Typography variant="body2" color="text.secondary">by {book.author}</Typography>
          <Typography variant="body2" color="text.secondary">Condition: {book.condition}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h5" color="primary" fontWeight="bold">
            Total: Rs. {book.price}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Bank Transfer Details */}
        {bankDetails && (
          <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="success.main" mb={1}>
              🏦 Bank Transfer Details
            </Typography>
            <Typography variant="body2"><b>Account Name:</b> {bankDetails.accountName}</Typography>
            <Typography variant="body2"><b>Account Number:</b> {bankDetails.accountNumber}</Typography>
            <Typography variant="body2"><b>Bank Branch:</b> {bankDetails.bankBranch}</Typography>
            <Typography variant="body2"><b>Amount:</b> Rs. {bankDetails.amount}</Typography>
            <Typography variant="body2"><b>Reference ID:</b> {bankDetails.transactionId}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="error">
              ⚠️ {bankDetails.message}
            </Typography>
          </Box>
        )}

        {/* Payment Method Selection */}
        <Typography variant="h6" fontWeight="bold" mb={1}>
          Select Payment Method
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="esewa"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight="bold" color="#60BB46">eSewa</Typography>
                  <Typography variant="body2" color="text.secondary">— Digital Wallet</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="khalti"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight="bold" color="#5C2D91">Khalti</Typography>
                  <Typography variant="body2" color="text.secondary">— Digital Wallet</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight="bold" color="#1976d2">Online Banking</Typography>
                  <Typography variant="body2" color="text.secondary">— Bank Transfer</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePayment}
          disabled={loading}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          {loading ? 'Processing...' : `Pay Rs. ${book.price}`}
        </Button>
      </Paper>
    </Container>
  );
}

export default Payment;