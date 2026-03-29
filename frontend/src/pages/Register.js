import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, TextField, Button,
  Typography, Paper, Alert, Grid
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    location: '', college: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Top Banner */}
          <Box sx={{
            bgcolor: '#1976d2',
            p: 3,
            textAlign: 'center',
            color: 'white',
          }}>
            <MenuBookIcon sx={{ fontSize: 40, mb: 0.5 }} />
            <Typography variant="h5" fontWeight="700">
              Join PustakHub
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Create your account today
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleRegister}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Full Name" name="name"
                    value={formData.name} onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Email Address" name="email"
                    type="email" value={formData.email}
                    onChange={handleChange} required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Password" name="password"
                    type="password" value={formData.password}
                    onChange={handleChange} required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Location" name="location"
                    value={formData.location} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="College" name="college"
                    value={formData.college} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth type="submit" variant="contained"
                size="large"
                sx={{
                  mt: 3, borderRadius: 2, py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                  fontSize: '16px', fontWeight: '600',
                  '&:hover': { background: 'linear-gradient(135deg, #1565c0, #0a3880)' }
                }}
              >
                Create Account
              </Button>
            </form>

            <Typography align="center" mt={3} variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1976d2', fontWeight: '600' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;