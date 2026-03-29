import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Button, Box, IconButton, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(saved);
  }, []);

  const removeFromWishlist = (bookId) => {
    const updated = wishlist.filter((b) => b._id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlist(updated);
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

      <Container sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FavoriteIcon sx={{ color: '#e53935' }} />
          <Typography variant="h4" fontWeight="700" color="#1976d2">
            My Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ({wishlist.length} books)
          </Typography>
        </Box>

        {wishlist.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              Your wishlist is empty!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Browse books and add them to your wishlist
            </Typography>
            <Button
              variant="contained" sx={{ borderRadius: 2 }}
              onClick={() => navigate('/')}
            >
              Browse Books
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {wishlist.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}>
                  <CardMedia
                    component="img" height="200"
                    image={book.image || 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={book.title}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/book/${book._id}`)}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" noWrap>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      ✍️ {book.author}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="#1976d2" fontWeight="700">
                        Rs. {book.price}
                      </Typography>
                      <IconButton
                        color="error" size="small"
                        onClick={() => removeFromWishlist(book._id)}
                        sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button
                      fullWidth variant="contained" size="small"
                      onClick={() => navigate(`/book/${book._id}`)}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                      }}
                    >
                      View Book
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Wishlist;