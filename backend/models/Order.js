const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            name: { type: String, required: true },
            size: { type: String },
            quantity: { type: Number, required: true },
            price: { type: String }, // Storing as string to keep 'N' or format if needed, or Number if preferred. Let's stick to string for now from frontend props
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    deliveryLocation: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    trackingId: {
        type: String,
        unique: true,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
