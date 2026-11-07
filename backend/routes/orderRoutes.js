const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, negotiateOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/track/:trackingId', protect, getOrderById);
router.patch('/:id/accept', protect, require('../controllers/orderController').acceptQuote);
router.post('/:id/pay', protect, require('../controllers/orderController').recordPayment);
router.get('/:id', protect, getOrderById);
router.patch('/:id/negotiate', protect, admin, negotiateOrder);

module.exports = router;
