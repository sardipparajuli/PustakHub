import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button,
  Paper, Grid, Card, CardContent,
  CardMedia, Chip, Divider, Alert, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Profile() {
  const [myBooks, setMyBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      const myBooks = res.data.filter((b) => b.seller._id === user.id);
      setMyBooks(myBooks);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Book deleted successfully!');
      fetchMyBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleMarkSold = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/books/${bookId}`,
        { isSold: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Book marked as sold!');
      fetchMyBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book');
    }
  };

  const conditionColor = {
    New: 'success', Good: 'primary',
    Average: 'warning', Poor: 'error',
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

        {/* Profile Card */}
        <Paper elevation={0} sx={{
          p: 4, borderRadius: 4, mb: 4,
          background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
          color: 'white',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{
              width: 80, height: 80, bgcolor: 'white',
              color: '#1976d2', fontSize: '32px', fontWeight: '700',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight="700">{user?.name}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                ✉️ {user?.email}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                📍 {user?.location || 'Location not set'} &nbsp;|&nbsp;
                🎓 {user?.college || 'College not set'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-book')}
              sx={{
                bgcolor: 'white', color: '#1976d2',
                fontWeight: '600', borderRadius: 2,
                '&:hover': { bgcolor: '#e3f2fd' },
              }}
            >
              Add Book
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="700">{myBooks.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Listed</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="700">
                {myBooks.filter((b) => b.isSold).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Sold</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="700">
                {myBooks.filter((b) => !b.isSold).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Available</Typography>
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* My Books */}
        <Typography variant="h5" fontWeight="700" mb={3} color="#1976d2">
          📚 My Listed Books
        </Typography>

        {myBooks.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              You haven't listed any books yet!
            </Typography>
            <Button
              variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate('/add-book')}
              sx={{ borderRadius: 2 }}
            >
              Add Your First Book
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {myBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img" height="180"
                      image={book.image || 'https://via.placeholder.com/200x200?text=No+Image'}
                      alt={book.title}
                    />
                    <Chip
                      label={book.isSold ? 'Sold' : 'Available'}
                      color={book.isSold ? 'error' : 'success'}
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, fontWeight: '600' }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" noWrap>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      ✍️ {book.author}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={book.condition}
                        color={conditionColor[book.condition] || 'default'}
                        size="small"
                      />
                      <Typography variant="h6" color="#1976d2" fontWeight="700">
                        Rs. {book.price}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!book.isSold && (
                        <>
                          <Button
                            variant="outlined" size="small" color="success"
                            onClick={() => handleMarkSold(book._id)}
                            sx={{ borderRadius: 2, flex: 1 }}
                          >
                            Mark Sold
                          </Button>
                          <Button
                            variant="outlined" size="small" color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/edit-book/${book._id}`)}
                            sx={{ borderRadius: 2 }}
                          >
                            Edit
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined" size="small" color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(book._id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    </Box>
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

export default Profile;