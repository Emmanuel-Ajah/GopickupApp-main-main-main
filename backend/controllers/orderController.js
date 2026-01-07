const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, pickupLocation, deliveryLocation } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Generate Tracking ID
        // Format: #TRK- + 8 random alphanumeric characters
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const trackingId = `#TRK-${randomStr}`;

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            pickupLocation,
            deliveryLocation,
            trackingId,
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID or Tracking ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        let order;

        // Try finding by internal ID first if it looks like a Mongo ID, else by trackingId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(id).populate('user', 'name email');
        }

        if (!order) {
            order = await Order.findOne({ trackingId: id }).populate('user', 'name email');
        }

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
};
