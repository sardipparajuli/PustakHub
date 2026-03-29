import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Button, Box, TextField, AppBar,
  Toolbar, IconButton, Badge, Chip, Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBooks();
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
    if (user) fetchUnreadCount();
    const interval = setInterval(() => {
      if (user) fetchUnreadCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/messages/unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.count);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = async () => {
    if (!search) { fetchBooks(); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/books/search/${search}`);
      setBooks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleWishlist = (book) => {
    const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = saved.find((b) => b._id === book._id);
    const updated = exists
      ? saved.filter((b) => b._id !== book._id)
      : [...saved, book];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlist(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const conditionColor = {
    New: 'success',
    Good: 'primary',
    Average: 'warning',
    Poor: 'error',
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Toolbar>
          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6" fontWeight="700"
            sx={{ flexGrow: 1, cursor: 'pointer', letterSpacing: 1 }}
            onClick={() => navigate('/')}
          >
            PustakHub
          </Typography>
          {user ? (
            <>
              <Tooltip title="My Profile">
                <Button
                  color="inherit"
                  onClick={() => navigate('/profile')}
                  sx={{ fontWeight: '600', textTransform: 'none' }}
                >
                  👤 {user.name}
                </Button>
              </Tooltip>
              <Tooltip title="Messages">
                <IconButton color="inherit" onClick={() => navigate('/inbox')}>
                  <Badge badgeContent={unreadCount} color="error">
                    <ChatBubbleIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="My Wishlist">
                <IconButton color="inherit" onClick={() => navigate('/wishlist')}>
                  <Badge badgeContent={wishlist.length} color="error">
                    <FavoriteIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Sell a Book">
                <IconButton color="inherit" onClick={() => navigate('/add-book')}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}
                sx={{ fontWeight: '600' }}>Login</Button>
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  ml: 1, bgcolor: 'white', color: '#1976d2',
                  fontWeight: '600', borderRadius: 2,
                  '&:hover': { bgcolor: '#e3f2fd' }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: 'white', py: 6, textAlign: 'center',
      }}>
        <Typography variant="h3" fontWeight="700" mb={1}>
          📚 Find Your Next Book
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, mb: 4 }}>
          Buy and sell used books in Nepal
        </Typography>

        {/* Search Bar */}
        <Container maxWidth="md">
          <Box sx={{
            display: 'flex', gap: 1,
            bgcolor: 'white', borderRadius: 3,
            p: 0.5, boxShadow: 3,
          }}>
            <TextField
              fullWidth
              placeholder="Search books by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              variant="standard"
              sx={{ px: 2, py: 0.5 }}
              InputProps={{ disableUnderline: true }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                borderRadius: 2, px: 3,
                background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Books Section */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="700" mb={3} color="#1976d2">
          📖 Available Books
        </Typography>

        <Grid container spacing={3}>
          {books.length === 0 ? (
            <Box sx={{ mt: 5, width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No books found! Be the first to add one 📚
              </Typography>
              {user && (
                <Button
                  variant="contained" sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => navigate('/add-book')}
                >
                  Add a Book
                </Button>
              )}
            </Box>
          ) : (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                <Card sx={{
                  height: '100%', borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25,118,210,0.2)',
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={book.image || 'https://via.placeholder.com/200x200?text=No+Image'}
                      alt={book.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/book/${book._id}`)}
                    />
                    <Chip
                      label={book.condition}
                      color={conditionColor[book.condition] || 'default'}
                      size="small"
                      sx={{
                        position: 'absolute', top: 8, right: 8,
                        fontWeight: '600',
                      }}
                    />
                  </Box>
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
                      <Typography variant="body2" sx={{
                        textDecoration: 'line-through', color: 'gray',
                      }}>
                        Rs. {book.mrp}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Book Details">
                        <Button
                          fullWidth variant="contained" size="small"
                          onClick={() => navigate(`/book/${book._id}`)}
                          sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>
                      <Tooltip title={wishlist.find((b) => b._id === book._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                        <IconButton
                          size="small"
                          color={wishlist.find((b) => b._id === book._id) ? 'error' : 'default'}
                          onClick={() => handleWishlist(book)}
                          sx={{
                            border: '1px solid',
                            borderColor: wishlist.find((b) => b._id === book._id) ? 'error.main' : 'grey.300',
                            borderRadius: 2,
                          }}
                        >
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;