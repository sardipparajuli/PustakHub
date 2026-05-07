const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Get message history between two users
router.get('/history/:otherId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.otherId;
    const messages = await Message.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId },
      ],
    }).sort({ sentAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
    }).sort({ sentAt: -1 });

    const conversationMap = {};
    messages.forEach((msg) => {
      const otherId = msg.from.toString() === userId ? msg.to.toString() : msg.from.toString();
      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          userId: otherId,
          lastMessage: msg.content,
          time: new Date(msg.sentAt).toLocaleTimeString(),
        };
      }
    });

    const conversations = await Promise.all(
      Object.values(conversationMap).map(async (conv) => {
        const user = await User.findById(conv.userId).select('name email');
        return {
          ...conv,
          name: user?.name || 'Unknown User',
          email: user?.email || '',
        };
      })
    );
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread messages count
router.get('/unread', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      to: userId,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/read/:otherId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { from: req.params.otherId, to: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save a message
router.post('/save', auth, async (req, res) => {
  try {
    const { to, content, fromName } = req.body;
    const message = new Message({
      from: req.user.id,
      to,
      content,
      fromName,
      sentAt: new Date(),
    });
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a message
router.delete('/delete/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (message.from.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ success: true, message: 'Message deleted!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;