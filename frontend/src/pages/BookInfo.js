import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, Grid, Chip, Divider, Avatar, Card, Alert
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function BookInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartMsg, setCartMsg] = useState('');
  const [cartError, setCartError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBook();
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${id}`);
      setBook(res.data);
      fetchRecommended(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRecommended = async (currentBook) => {
    try {
      const allBooks = await axios.get('http://localhost:5000/api/books');
      const res = await axios.post('http://localhost:5001/recommend', {
        books: allBooks.data,
        currentBookId: currentBook._id,
      });
      setRecommended(res.data);
    } catch (err) {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/search/${currentBook.title}`);
        setRecommended(res.data.filter((b) => b._id !== id));
      } catch (err2) {
        console.log(err2);
      }
    }
  };

  const handleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = saved.find((b) => b._id === book._id);
    const updated = exists
      ? saved.filter((b) => b._id !== book._id)
      : [...saved, book];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlist(updated);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { bookId: book._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartMsg('Book added to cart successfully! 🛒');
      setCartError('');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setCartError(''), 3000);
    }
  };

  const conditionColor = {
    New: 'success', Good: 'primary',
    Average: 'warning', Poor: 'error',
  };

  if (!book) return (
    <Container sx={{ mt: 5, textAlign: 'center' }}>
      <Typography>Loading...</Typography>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        color: 'white', py: 2, px: 3,
        display: 'flex', alignItems: 'center', gap: 2,
        cursor: 'pointer',
      }}
        onClick={() => navigate('/')}
      >
        <MenuBookIcon />
        <Typography variant="h6" fontWeight="700">
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

        {cartMsg && <Alert severity="success" sx={{ mb: 2 }}>{cartMsg}</Alert>}
        {cartError && <Alert severity="error" sx={{ mb: 2 }}>{cartError}</Alert>}

        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
          <Grid container>
            {/* Book Image */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 3, bgcolor: '#f8f9fa', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img
                  src={book.image || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={book.title}
                  style={{
                    width: '100%', maxHeight: '400px',
                    objectFit: 'cover', borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                />
              </Box>
            </Grid>

            {/* Book Details */}
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={book.condition}
                    color={conditionColor[book.condition] || 'default'}
                    sx={{ fontWeight: '600' }}
                  />
                  {book.genre && <Chip label={book.genre} color="secondary" variant="outlined" />}
                  {book.branch && <Chip label={book.branch} variant="outlined" />}
                  {book.edition && <Chip label={`Edition: ${book.edition}`} variant="outlined" />}
                </Box>

                <Typography variant="h3" fontWeight="700" mb={1}>
                  {book.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" mb={3}>
                  ✍️ by {book.author}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="h3" color="#1976d2" fontWeight="700">
                    Rs. {book.price}
                  </Typography>
                  <Box>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'gray' }}>
                      Rs. {book.mrp}
                    </Typography>
                    <Chip
                      label={`${Math.round((1 - book.price / book.mrp) * 100)}% OFF`}
                      color="error" size="small"
                      sx={{ fontWeight: '700' }}
                    />
                  </Box>
                </Box>

                {book.description && (
                  <Typography variant="body1" color="text.secondary" mb={3} sx={{ lineHeight: 1.8 }}>
                    {book.description}
                  </Typography>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Seller Info */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="700" mb={1}>
                    Seller Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                      {book.seller?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="primary" />
                        <Typography variant="body1" fontWeight="600">{book.seller?.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{book.seller?.location}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{book.seller?.college}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {user && user.id !== book.seller?._id && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<ChatIcon />}
                        onClick={() => navigate(`/chat/${book.seller?._id}`)}
                        sx={{
                          borderRadius: 2, px: 3,
                          background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                        }}
                      >
                        Contact Seller
                      </Button>
                      <Button
                        variant="contained" color="success"
                        onClick={() => navigate('/payment', { state: { book } })}
                        sx={{ borderRadius: 2, px: 3 }}
                      >
                        💳 Buy Now
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAddToCart}
                        sx={{ borderRadius: 2 }}
                      >
                        Add to Cart
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<FavoriteIcon />}
                    color={wishlist.find((b) => b._id === book._id) ? 'error' : 'primary'}
                    onClick={handleWishlist}
                    sx={{ borderRadius: 2 }}
                  >
                    {wishlist.find((b) => b._id === book._id) ? 'Wishlisted ❤️' : 'Add to Wishlist'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Recommended Books */}
        {recommended.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" fontWeight="700" mb={3} color="#1976d2">
              📚 Similar Books You Might Like
              <Typography component="span" variant="body1" color="text.secondary" ml={1}>
                ({recommended.length} books)
              </Typography>
            </Typography>

            {/* Fixed equal size grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '16px',
            }}>
              {recommended.map((b) => (
                <Card
                  key={b._id}
                  onClick={() => navigate(`/book/${b._id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '280px', // Fixed height for all cards
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(25,118,210,0.2)'
                    }
                  }}
                >
                  {/* Fixed image */}
                  <Box sx={{
                    width: '100%',
                    height: '160px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={b.image || 'https://via.placeholder.com/150x160?text=No+Image'}
                      alt={b.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Box>

                  {/* Fixed content */}
                  <Box sx={{
                    p: 1.5,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}>
                    <Box>
                      {/* Title — always 1 line, truncated */}
                      <Typography
                        variant="subtitle2"
                        fontWeight="700"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {b.title}
                      </Typography>
                      {/* Author — always 1 line, truncated */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {b.author}
                      </Typography>
                    </Box>
                    <Box>
                      {b.genre && (
                        <Chip
                          label={b.genre} size="small"
                          sx={{
                            fontSize: '9px', height: '18px',
                            color: '#1976d2', borderColor: '#1976d2',
                            mb: 0.5,
                          }}
                          variant="outlined"
                        />
                      )}
                      <Typography variant="subtitle2" color="#1976d2" fontWeight="700">
                        Rs. {b.price}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default BookInfo;