const Review = require("../models/Review");
const Order = require("../models/Order");

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { orderId, rating, experience, feedback, tags, tip } = req.body;

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is the one who placed the order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to review this order" });
        }

        // Check if review already exists for this order
        const existingReview = await Review.findOne({ order: orderId });
        if (existingReview) {
            return res.status(400).json({ message: "Order already reviewed" });
        }

        const review = await Review.create({
            order: orderId,
            user: req.user._id,
            riderName: "Dauda", // Should ideally come from the order's assigned driver
            rating,
            experience,
            feedback,
            tags,
            tip,
        });

        res.status(201).json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for logged in user
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id }).populate("order");
        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
