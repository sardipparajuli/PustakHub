import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, Divider, Alert, Radio,
  RadioGroup, FormControlLabel, FormControl
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  const handlePayment = async () => {
    if (!book) { setError('Book details not found!'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');

      if (paymentMethod === 'esewa') {
        // Mock eSewa payment — redirect directly to success
        setTimeout(() => {
          navigate(`/payment/success?bookId=${book._id}&method=esewa`);
        }, 1500);

      } else if (paymentMethod === 'khalti') {
        // Mock Khalti payment — redirect directly to success
        setTimeout(() => {
          navigate(`/payment/success?bookId=${book._id}&method=khalti`);
        }, 1500);

      } else if (paymentMethod === 'bank') {
        const res = await axios.post(
          'http://localhost:5000/api/payment/bank/initiate',
          { amount: book.price, bookId: book._id, bookTitle: book.title, bankName: 'Nepal Bank' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBankDetails(res.data.bankDetails);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('Payment failed! Please try again.');
      setLoading(false);
    }
  };

  if (!book) return (
    <Container sx={{ mt: 5, textAlign: 'center' }}>
      <Typography>Book details not found!</Typography>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        color: 'white', py: 2, px: 3,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <MenuBookIcon />
        <Typography variant="h6" fontWeight="700" sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}>
          PustakHub
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight="700" color="primary" mb={2}>
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
              <Button
                fullWidth variant="contained" color="success"
                sx={{ mt: 2, borderRadius: 2 }}
                onClick={() => navigate(`/payment/success?bookId=${book._id}&method=bank`)}
              >
                ✅ I have completed the transfer
              </Button>
            </Box>
          )}

          {/* Payment Method Selection */}
          {!bankDetails && (
            <>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Select Payment Method
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <Paper elevation={0} sx={{
                    mb: 1, p: 1.5, borderRadius: 2,
                    border: paymentMethod === 'esewa' ? '2px solid #60BB46' : '1px solid #e0e0e0'
                  }}>
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
                  </Paper>
                  <Paper elevation={0} sx={{
                    mb: 1, p: 1.5, borderRadius: 2,
                    border: paymentMethod === 'khalti' ? '2px solid #5C2D91' : '1px solid #e0e0e0'
                  }}>
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
                  </Paper>
                  <Paper elevation={0} sx={{
                    mb: 1, p: 1.5, borderRadius: 2,
                    border: paymentMethod === 'bank' ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}>
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
                  </Paper>
                </RadioGroup>
              </FormControl>

              <Button
                fullWidth variant="contained" size="large"
                onClick={handlePayment}
                disabled={loading}
                sx={{
                  borderRadius: 2, py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                  fontSize: '16px', fontWeight: '600',
                }}
              >
                {loading ? 'Processing Payment...' : `Pay Rs. ${book.price}`}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Payment;