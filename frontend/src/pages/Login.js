import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, TextField, Button,
  Typography, Paper, Alert
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Top Banner */}
          <Box sx={{
            bgcolor: '#1976d2',
            p: 4,
            textAlign: 'center',
            color: 'white',
          }}>
            <MenuBookIcon sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h4" fontWeight="700">
              PustakHub
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Nepal's Book Marketplace
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="600" mb={1}>
              Welcome Back! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Login to your account to continue
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth label="Email Address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                margin="normal" required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth label="Password" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                margin="normal" required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
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
                Login
              </Button>
            </form>

            <Typography align="center" mt={3} variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1976d2', fontWeight: '600' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;