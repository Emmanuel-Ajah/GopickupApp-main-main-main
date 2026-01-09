const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, orderId, isVoiceNote, voiceNoteUrl } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content,
            order: orderId,
            isVoiceNote,
            voiceNoteUrl,
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: req.params.otherUserId },
                { sender: req.params.otherUserId, recipient: req.user._id },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        const conversationUsers = new Set();
        const contactIds = [];

        messages.forEach(msg => {
            const otherUser = msg.sender.toString() === userId.toString() ? msg.recipient.toString() : msg.sender.toString();
            if (!conversationUsers.has(otherUser)) {
                conversationUsers.add(otherUser);
                contactIds.push(otherUser);
            }
        });

        const users = await User.find({ _id: { $in: contactIds } }).select('name email userId role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
};
