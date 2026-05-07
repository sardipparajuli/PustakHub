import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, Divider, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.books || []);
      calculateTotal(res.data.books || []);
    } catch (err) {
      console.log(err);
    }
  };

  const calculateTotal = (books) => {
    const total = books.reduce((sum, item) => sum + (item.book?.price || 0), 0);
    setTotal(total);
  };

  const handleRemove = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/remove/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Navigate to payment with first book
    navigate('/payment', { state: { book: cart[0].book, isCart: true, cartTotal: total } });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        color: 'white', py: 2, px: 3,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <MenuBookIcon />
        <Typography
          variant="h6" fontWeight="700" sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          PustakHub
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ShoppingCartIcon sx={{ color: '#1976d2' }} />
          <Typography variant="h4" fontWeight="700" color="#1976d2">
            My Cart
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ({cart.length} {cart.length === 1 ? 'book' : 'books'})
          </Typography>
        </Box>

        {cart.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              Your cart is empty!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Browse books and add them to your cart
            </Typography>
            <Button
              variant="contained" sx={{ borderRadius: 2 }}
              onClick={() => navigate('/')}
            >
              Browse Books
            </Button>
          </Paper>
        ) : (
          <Box>
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
              {cart.map((item, index) => (
                <Box key={item.book?._id}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center',
                    gap: 2, p: 2,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}>
                    {/* Book Image */}
                    <Box
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/book/${item.book?._id}`)}
                    >
                      <img
                        src={item.book?.image || 'https://via.placeholder.com/80x100?text=Book'}
                        alt={item.book?.title}
                        style={{
                          width: '80px', height: '100px',
                          objectFit: 'cover', borderRadius: '8px',
                        }}
                      />
                    </Box>

                    {/* Book Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="700" noWrap>
                        {item.book?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ✍️ {item.book?.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Condition: {item.book?.condition}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Seller: {item.book?.seller?.name}
                      </Typography>
                    </Box>

                    {/* Price and Remove */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="#1976d2" fontWeight="700">
                        Rs. {item.book?.price}
                      </Typography>
                      <Typography variant="body2" sx={{
                        textDecoration: 'line-through', color: 'gray'
                      }}>
                        Rs. {item.book?.mrp}
                      </Typography>
                      <Tooltip title="Remove from Cart">
                        <IconButton
                          color="error" size="small"
                          onClick={() => handleRemove(item.book?._id)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {index < cart.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Order Summary */}
            <Paper elevation={0} sx={{ borderRadius: 4, p: 3 }}>
              <Typography variant="h6" fontWeight="700" mb={2}>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cart.map((item) => (
                <Box key={item.book?._id} sx={{
                  display: 'flex', justifyContent: 'space-between', mb: 1
                }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                    {item.book?.title}
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    Rs. {item.book?.price}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="700">Total</Typography>
                <Typography variant="h6" fontWeight="700" color="#1976d2">
                  Rs. {total}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth variant="contained" size="large"
                  onClick={handleCheckout}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                  }}
                >
                  💳 Proceed to Checkout
                </Button>
                <Button
                  variant="outlined" color="error" size="large"
                  onClick={handleClearCart}
                  sx={{ borderRadius: 2 }}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Cart;