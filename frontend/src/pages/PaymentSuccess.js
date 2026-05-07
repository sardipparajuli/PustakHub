import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, CircularProgress, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [transactionId] = useState(`TXN${Date.now()}`);
  const bookId = searchParams.get('bookId');
  const pidx = searchParams.get('pidx');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token');
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
        setStatus('success');
      }
    } catch (err) {
      setStatus('failed');
    }
  };

  const currentTime = new Date().toLocaleString('en-NP', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8, #e3f2fd)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      py: 4,
    }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
          {status === 'loading' && (
            <Box>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6">Verifying Payment...</Typography>
            </Box>
          )}

          {status === 'success' && (
            <Box>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="700" color="success.main" mb={1}>
                Transaction Successful! 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Your payment has been completed successfully!
              </Typography>

              {/* Mock Transaction Details */}
              <Paper elevation={0} sx={{
                bgcolor: '#f0f4f8', p: 3,
                borderRadius: 3, mb: 3, textAlign: 'left'
              }}>
                <Typography variant="h6" fontWeight="700" mb={2} color="#1976d2">
                  📋 Transaction Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body2" fontWeight="600">{transactionId}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body2" fontWeight="600">{currentTime}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body2" fontWeight="600" color="success.main">
                    ✅ Completed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Platform</Typography>
                  <Typography variant="body2" fontWeight="600">PustakHub</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  The seller will contact you soon to arrange the handover! 📚
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained" size="large"
                  onClick={() => navigate('/')}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                  }}
                >
                  Go Home
                </Button>
                {bookId && (
                  <Button
                    variant="outlined" size="large"
                    onClick={() => navigate(`/book/${bookId}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    View Book
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {status === 'failed' && (
            <Box>
              <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="700" color="error.main" mb={1}>
                Transaction Failed! 😔
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Something went wrong with your payment. Please try again!
              </Typography>
              <Button
                variant="contained" color="error" size="large"
                onClick={() => navigate(-1)}
                sx={{ borderRadius: 2 }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default PaymentSuccess;