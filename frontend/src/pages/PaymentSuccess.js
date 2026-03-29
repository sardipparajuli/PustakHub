import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const bookId = searchParams.get('bookId');
  const pidx = searchParams.get('pidx');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token');

      // If pidx exists it's Khalti payment
      if (pidx) {
        const res = await axios.post(
          'http://localhost:5000/api/payment/khalti/verify',
          { pidx },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } else {
        // eSewa or bank payment
        setStatus('success');
      }
    } catch (err) {
      setStatus('failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        {status === 'loading' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Verifying Payment...</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main" mb={1}>
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Your payment has been completed successfully. The seller will contact you soon!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2, mr: 1 }}
            >
              Go Home
            </Button>
            {bookId && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(`/book/${bookId}`)}
                sx={{ borderRadius: 2 }}
              >
                View Book
              </Button>
            )}
          </Box>
        )}

        {status === 'failed' && (
          <Box>
            <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="error.main" mb={1}>
              Payment Failed! 😔
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Something went wrong with your payment. Please try again!
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default PaymentSuccess;