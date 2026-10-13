const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, orderId, isVoiceNote, voiceNoteUrl } = req.body;

        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.isBanned || (req.user.role !== 'admin' && recipient.role !== 'admin')) return res.status(403).json({ message: 'Select an available support contact.' });
        if (typeof content !== 'string' || !content.trim() || content.length > 4000) return res.status(400).json({ message: 'Message must be 1–4000 characters.' });
        if (orderId && !await require('../models/Order').exists({ _id: orderId, user: req.user.role === 'admin' ? recipient._id : req.user._id })) return res.status(403).json({ message: 'Order is not part of this conversation.' });
        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content,
            order: orderId,
            isVoiceNote,
            voiceNoteUrl,
        });

        // Live support assistant auto-replies to customers
        if (req.user.role !== 'admin' && recipient.role === 'admin') {
            setTimeout(async () => {
                try {
                    let replyText = "Hello! Our support dispatch team has received your message and is reviewing your request.";
                    const text = content.toLowerCase();
                    if (text.includes("coal") || text.includes("goods") || text.includes("load") || text.includes("moving") || text.includes("trip")) {
                        replyText = "From your request, I see that you've chosen dispatch equipment. What is your exact pickup location and preferred schedule?";
                    } else if (text.includes("location") || text.includes("wuse") || text.includes("abuja") || text.includes("asokoro") || text.includes("lagos")) {
                        replyText = "Location confirmed! Our nearest driver is approximately 10-15 mins away from your pickup point.";
                    } else if (text.includes("price") || text.includes("cost") || text.includes("rate") || text.includes("negotiate") || text.includes("how much")) {
                        replyText = "We can offer a discounted rate for this trip. Please confirm if you would like us to book the driver now.";
                    } else if (text.includes("yes") || text.includes("proceed") || text.includes("okay") || text.includes("ok") || text.includes("sure")) {
                        replyText = "Awesome! Driver is dispatched. You can track your shipment live on the Map tab!";
                    }
                    await Message.create({
                        sender: recipientId,
                        recipient: req.user._id,
                        content: replyText,
                        order: orderId,
                    });
                } catch (e) {
                    console.error("Support assistant error:", e);
                }
            }, 1000);
        }

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
