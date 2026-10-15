const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    isVoiceNote: {
        type: Boolean,
        default: false,
    },
    voiceNoteUrl: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
    },
    fileType: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'delivered',
    },
    replyTo: {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        content: {
            type: String,
        },
        senderName: {
            type: String,
        },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Message', messageSchema);
