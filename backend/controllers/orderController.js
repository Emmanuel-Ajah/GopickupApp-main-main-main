const Order = require("../models/Order");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation, vehicle, description, weight, contactPhone, scheduledAt } = req.body;
    const kind = req.body.kind === 'load' ? 'load' : 'materials';
    if (![pickupLocation, deliveryLocation, contactPhone].every(v => typeof v === 'string' && v.trim()))
      return res.status(400).json({ message: 'Pickup, delivery address and contact phone are required.' });
    if (kind === 'load' && (!['Van','Pick Up','Truck','Flat bed','Trailer','Trailer / Tractor','Tipper'].includes(vehicle) || !description?.trim()))
      return res.status(400).json({ message: 'Select a vehicle and describe your goods.' });
    if (scheduledAt && (!Number.isFinite(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now()))
      return res.status(400).json({ message: 'Choose a future delivery date.' });
    const items = kind === 'load' ? [{ name: description, quantity: 1, price: '0' }] : require('../catalog').priceItems(req.body.items);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const status = 'Pending Negotiation';
    const order = await Order.create({
      user: req.user._id, items, totalAmount, pickupLocation: pickupLocation.trim(), deliveryLocation: deliveryLocation.trim(),
      trackingId: 'TRK-' + require('crypto').randomUUID().slice(0, 8).toUpperCase(),
      kind, vehicle, description, weight, contactPhone, scheduledAt: scheduledAt || undefined,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0), status, events: [{ status }],
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const filter = req.params.trackingId
      ? { trackingId: { $in: [req.params.trackingId.replace(/^#/, '').toUpperCase(), '#' + req.params.trackingId.replace(/^#/, '').toUpperCase()] } }
      : { _id: req.params.id };
    if (req.user.role !== 'admin') filter.user = req.user._id;
    const order = await Order.findOne(filter)
      .populate("user", "name email")
      .lean();

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
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
      if (negotiatedPrice !== undefined && (!Number.isFinite(negotiatedPrice) || negotiatedPrice <= 0))
        return res.status(400).json({ message: 'Enter a positive quote.' });
      const transitions = { 'Pending': ['Pending Negotiation', 'Cancelled'], 'Pending Negotiation': ['Cancelled'], 'Processing': ['In Transit','Cancelled'], 'In Transit': ['Delivered'], 'Delivered': [], 'Cancelled': [] };
      if (status && status !== order.status && !transitions[order.status]?.includes(status))
        return res.status(400).json({ message: 'Invalid status change. The customer must accept a quote first.' });
      if (negotiatedPrice !== undefined && !['Pending','Pending Negotiation'].includes(order.status))
        return res.status(400).json({ message: 'Accepted quotes cannot be changed.' });
      if (status && status !== order.status) order.events.push({ status });
      order.negotiatedPrice =
        negotiatedPrice !== undefined ? negotiatedPrice : order.negotiatedPrice;
      order.status = status || order.status;
      order.paymentStatus = paymentStatus || order.paymentStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  negotiateOrder,
};

module.exports.acceptQuote = async (req, res) => {
  const order = await Order.findOneAndUpdate({ _id: req.params.id, user: req.user._id, status: 'Pending Negotiation', negotiatedPrice: { $gt: 0 } },
    { $set: { status: 'Processing' }, $push: { events: { status: 'Processing', at: new Date() } } }, { new: true });
  if (!order) return res.status(400).json({ message: 'No quote awaiting acceptance.' });
  res.json(order);
};
