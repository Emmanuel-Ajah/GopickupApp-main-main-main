const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, pickupLocation, deliveryLocation, status } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Generate Tracking ID
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const trackingId = `#TRK-${randomStr}`;

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount: totalAmount || 0,
            pickupLocation,
            deliveryLocation,
            trackingId,
            status: status || 'Pending',
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order for negotiation
// @route   PATCH /api/orders/:id/negotiate
// @access  Private/Admin
const negotiateOrder = async (req, res) => {
    try {
        const { negotiatedPrice, status, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.negotiatedPrice = negotiatedPrice !== undefined ? negotiatedPrice : order.negotiatedPrice;
            order.status = status || order.status;
            order.paymentStatus = paymentStatus || order.paymentStatus;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
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
    getAllOrders,
    negotiateOrder,
};
