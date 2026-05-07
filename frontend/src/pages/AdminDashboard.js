import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Paper, Grid,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton,
  Tabs, Tab, Avatar, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MessageIcon from '@mui/icons-material/Message';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.email !== 'admin@pustakhub.com') {
      navigate('/login');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchBooks();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) { console.log(err); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchStats();
    } catch (err) { console.log(err); }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
      fetchStats();
    } catch (err) { console.log(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { label: 'Total Books', value: stats.totalBooks || 0, icon: <MenuBookIcon sx={{ fontSize: 40 }} />, color: '#388e3c' },
    { label: 'Books Sold', value: stats.soldBooks || 0, icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />, color: '#f57c00' },
    { label: 'Available Books', value: stats.availableBooks || 0, icon: <CheckCircleIcon sx={{ fontSize: 40 }} />, color: '#7b1fa2' },
    { label: 'Total Messages', value: stats.totalMessages || 0, icon: <MessageIcon sx={{ fontSize: 40 }} />, color: '#c62828' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        color: 'white', py: 2, px: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MenuBookIcon />
          <Typography variant="h6" fontWeight="700">
            PustakHub — Admin Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">👤 Admin</Typography>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Container sx={{ py: 4 }}>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={2.4} key={card.label}>
              <Paper elevation={0} sx={{
                p: 3, borderRadius: 3, textAlign: 'center',
                borderTop: `4px solid ${card.color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                <Typography variant="h4" fontWeight="700" color={card.color}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(e, newVal) => setTab(newVal)}
            sx={{
              bgcolor: '#1976d2',
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
              '& .Mui-selected': { color: 'white !important' },
              '& .MuiTabs-indicator': { bgcolor: 'white' },
            }}
          >
            <Tab label={`👥 Users (${users.length})`} />
            <Tab label={`📚 Books (${books.length})`} />
          </Tabs>

          {/* Users Tab */}
          {tab === 0 && (
            <TableContainer sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                    <TableCell fontWeight="700"><b>User</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Location</b></TableCell>
                    <TableCell><b>College</b></TableCell>
                    <TableCell><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: '14px' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="600">{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.location || '—'}</TableCell>
                      <TableCell>{u.college || '—'}</TableCell>
                      <TableCell>
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error" size="small"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Books Tab */}
          {tab === 1 && (
            <TableContainer sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                    <TableCell><b>Book</b></TableCell>
                    <TableCell><b>Author</b></TableCell>
                    <TableCell><b>Genre</b></TableCell>
                    <TableCell><b>Price</b></TableCell>
                    <TableCell><b>Condition</b></TableCell>
                    <TableCell><b>Seller</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img
                            src={book.image || 'https://via.placeholder.com/40x50?text=Book'}
                            alt={book.title}
                            style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <Typography variant="body2" fontWeight="600" sx={{ maxWidth: '150px' }} noWrap>
                            {book.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Chip label={book.genre || 'Other'} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#1976d2">Rs. {book.price}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={book.condition} size="small"
                          color={book.condition === 'New' ? 'success' : book.condition === 'Good' ? 'primary' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{book.seller?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={book.isSold ? 'Sold' : 'Available'}
                          size="small"
                          color={book.isSold ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete Book">
                          <IconButton
                            color="error" size="small"
                            onClick={() => handleDeleteBook(book._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;