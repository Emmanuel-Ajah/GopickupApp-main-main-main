const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, orderId, isVoiceNote, voiceNoteUrl, fileUrl, fileName, fileType, fileSize, replyTo } = req.body;

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
            fileUrl,
            fileName,
            fileType,
            fileSize,
            replyTo: replyTo && replyTo.messageId ? {
                messageId: replyTo.messageId,
                content: replyTo.content,
                senderName: replyTo.senderName,
            } : undefined,
        });

        // Notify recipient of new message
        const { createNotification } = require('./notificationController');
        createNotification({
            userId: recipientId,
            title: `Message from ${req.user.name || 'GoPickup User'}`,
            body: isVoiceNote ? '🎙️ Voice note' : (fileUrl ? `📎 File: ${fileName || 'Attachment'}` : (content || '').slice(0, 80)),
            type: 'message',
            data: { senderId: req.user._id, messageId: message._id, orderId },
        });

        // Live support assistant auto-replies to customers
        if (req.user.role !== 'admin' && recipient.role === 'admin') {
            setTimeout(async () => {
                try {
                    await Message.findByIdAndUpdate(message._id, {
                        isRead: true,
                        status: 'read',
                        readAt: new Date(),
                    });

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
                    const replyMsg = await Message.create({
                        sender: recipientId,
                        recipient: req.user._id,
                        content: replyText,
                        order: orderId,
                    });

                    createNotification({
                        userId: req.user._id,
                        title: 'GoPickup Support',
                        body: replyText.slice(0, 80),
                        type: 'message',
                        data: { senderId: recipientId, messageId: replyMsg._id, orderId },
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
        await Message.updateMany(
            { sender: req.params.otherUserId, recipient: req.user._id, isRead: false },
            { $set: { isRead: true, status: 'read', readAt: new Date() } }
        );

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

// @desc    Mark messages as read
// @route   PATCH /api/messages/read/:otherUserId
// @access  Private
const markAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { sender: req.params.otherUserId, recipient: req.user._id, isRead: false },
            { $set: { isRead: true, status: 'read', readAt: new Date() } }
        );
        res.json({ message: "Messages marked as read" });
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

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const isSender = message.sender.toString() === req.user._id.toString();
        const isRecipient = message.recipient.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isSender && !isRecipient && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Message deleted successfully", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    markAsRead,
    getConversations,
    deleteMessage,
};
