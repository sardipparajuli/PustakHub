import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, TextField, Button,
  Typography, Paper, Alert, MenuItem, Chip
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

function AddBook() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    edition: '',
    branch: '',
    condition: '',
    mrp: '',
    price: '',
    description: '',
    image: '',
    ageYears: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const conditions = ['New', 'Good', 'Average', 'Poor'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSuggestPrice = async () => {
    if (!formData.mrp || !formData.condition) {
      setError('Please enter MRP and Condition first!');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/suggest-price', {
        mrp: formData.mrp,
        condition: formData.condition,
        ageYears: formData.ageYears || 1,
      });
      setPriceSuggestion(res.data);
      setFormData({ ...formData, price: res.data.suggestedPrice });
      setError('');
    } catch (err) {
      setError('ML service not running! Start app.py first.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let imageUrl = formData.image;

      if (imageFile) {
        setUploading(true);
        const imageData = new FormData();
        imageData.append('image', imageFile);
        const uploadRes = await axios.post('http://localhost:5000/api/upload', imageData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        imageUrl = uploadRes.data.imageUrl;
        setUploading(false);
      }

      await axios.post('http://localhost:5000/api/books',
        { ...formData, image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Book added successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
            📚 Add a Book to Sell
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Book Title" name="title"
              value={formData.title} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Author" name="author"
              value={formData.author} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Subject" name="subject"
              value={formData.subject} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Edition" name="edition"
              value={formData.edition} onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth label="Branch" name="branch"
              value={formData.branch} onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth select label="Condition" name="condition"
              value={formData.condition} onChange={handleChange}
              margin="normal" required
            >
              {conditions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="MRP (Original Price)" name="mrp"
              type="number" value={formData.mrp} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Age of Book (in years)" name="ageYears"
              type="number" value={formData.ageYears} onChange={handleChange}
              margin="normal"
            />

            {/* Price Suggestion Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleSuggestPrice}
              sx={{ mt: 1, mb: 1, borderRadius: 2 }}
            >
              🤖 Suggest Price Using AI
            </Button>

            {/* Price Suggestion Result */}
            {priceSuggestion && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  💡 AI Price Suggestion
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Min: Rs. ${priceSuggestion.minPrice}`} color="warning" />
                  <Chip label={`Suggested: Rs. ${priceSuggestion.suggestedPrice}`} color="success" />
                  <Chip label={`Max: Rs. ${priceSuggestion.maxPrice}`} color="error" />
                </Box>
              </Box>
            )}

            <TextField
              fullWidth label="Selling Price" name="price"
              type="number" value={formData.price} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Description" name="description"
              value={formData.description} onChange={handleChange}
              margin="normal" multiline rows={3}
            />

            {/* Image Upload */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Book Cover Image
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: '8px' }}
              />
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '150px', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>

            <Button
              fullWidth type="submit" variant="contained"
              size="large" sx={{ mt: 3, borderRadius: 2 }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Add Book'}
            </Button>
            <Button
              fullWidth variant="outlined"
              size="large" sx={{ mt: 1, borderRadius: 2 }}
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default AddBook;