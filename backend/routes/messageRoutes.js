const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, markAsRead, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.patch('/read/:otherUserId', protect, markAsRead);
router.get('/:otherUserId', protect, getMessages);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
