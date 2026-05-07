import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import {
  Container, Box, Typography, TextField,
  Button, Paper, Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const socket = io('http://localhost:5000');

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const room = [user?.id, userId].sort().join('-');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchReceiver();
    fetchPreviousMessages();
    markAsRead();
    socket.emit('join_room', room);

    socket.on('receive_message', (data) => {
      // Only add message if it's from the OTHER person
      if (data.sender !== user.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on('message_deleted', (deletedId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPreviousMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/messages/history/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.map((msg) => ({
        _id: msg._id,
        room,
        message: msg.content,
        sender: msg.from,
        senderName: msg.fromName,
        time: new Date(msg.sentAt).toLocaleTimeString(),
      })));
    } catch (err) { console.log(err); }
  };

  const fetchReceiver = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      const sellerBook = res.data.find((b) => b.seller._id === userId);
      if (sellerBook) setReceiver(sellerBook.seller);
    } catch (err) { console.log(err); }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/messages/read/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.log(err); }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      room,
      message,
      sender: user.id,
      senderName: user.name,
      time: new Date().toLocaleTimeString(),
    };

    // Add message to UI immediately
    setMessages((prev) => [...prev, newMessage]);

    // Emit to socket for other user
    socket.emit('send_message', newMessage);

    // Save to database
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/messages/save',
        { to: userId, content: message, fromName: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update with database _id
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          _id: res.data._id
        };
        return updated;
      });
    } catch (err) { console.log(err); }

    setMessage('');
  };

  const handleDelete = async (msgId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/messages/delete/${msgId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      socket.emit('delete_message', { room, messageId: msgId });
    } catch (err) { console.log(err); }
  };

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

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>

        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Chat Header */}
          <Box sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
            color: 'white',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Avatar sx={{
              bgcolor: 'white', color: '#1976d2',
              fontWeight: '700', width: 48, height: 48,
            }}>
              {receiver?.name?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">
                {receiver?.name || 'Chat'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {receiver?.college || ''}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Messages */}
          <Box sx={{
            p: 3, height: '450px',
            overflowY: 'auto', bgcolor: '#f8f9fa',
          }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography color="text.secondary" variant="h6">
                  👋 Start the conversation!
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === user.id ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  {msg.sender !== user.id && (
                    <Avatar sx={{
                      bgcolor: '#1976d2', width: 32, height: 32,
                      fontSize: '14px', mr: 1, mt: 0.5,
                    }}>
                      {msg.senderName?.[0]}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: '65%' }}>
                    <Box sx={{
                      bgcolor: msg.sender === user.id ? '#1976d2' : 'white',
                      color: msg.sender === user.id ? 'white' : 'black',
                      p: 1.5,
                      borderRadius: msg.sender === user.id
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                      <Typography variant="body1">{msg.message}</Typography>
                      <Box sx={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', mt: 0.3,
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {msg.time}
                        </Typography>
                        {msg.sender === user.id && msg._id && (
                          <Tooltip title="Delete message">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(msg._id)}
                              sx={{ color: 'rgba(255,255,255,0.7)', p: 0.3, ml: 1 }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{
            p: 2, display: 'flex', gap: 2,
            bgcolor: 'white', alignItems: 'center',
          }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                borderRadius: 3, px: 3, py: 1,
                background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                minWidth: 'auto',
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Chat;