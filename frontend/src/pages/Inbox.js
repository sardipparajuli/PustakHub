import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Paper,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Divider, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) {
      console.log(err);
    }
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
          <ChatIcon sx={{ color: '#1976d2' }} />
          <Typography variant="h4" fontWeight="700" color="#1976d2">
            My Inbox
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {conversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No conversations yet!
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Contact a seller to start a conversation
              </Typography>
              <Button
                variant="contained" sx={{ borderRadius: 2 }}
                onClick={() => navigate('/')}
              >
                Browse Books
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {conversations.map((conv, index) => (
                <React.Fragment key={conv.userId}>
                  <ListItem
                    sx={{
                      cursor: 'pointer', py: 2,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#f0f4f8' },
                    }}
                    onClick={() => navigate(`/chat/${conv.userId}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: '#1976d2', width: 50, height: 50,
                        fontSize: '20px', fontWeight: '700',
                      }}>
                        {conv.name?.[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="700">
                          {conv.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {conv.lastMessage || 'Click to start chatting'}
                        </Typography>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        {conv.time || ''}
                      </Typography>
                      <Box sx={{
                        mt: 0.5, px: 1.5, py: 0.3,
                        bgcolor: '#e3f2fd', borderRadius: 10,
                        color: '#1976d2', fontSize: '11px', fontWeight: '600',
                      }}>
                        View Chat
                      </Box>
                    </Box>
                  </ListItem>
                  {index < conversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Inbox;