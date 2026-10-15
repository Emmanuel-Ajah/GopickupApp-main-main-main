const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, toggleUserBan, googleLogin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const account = require('../controllers/authController');
router.post('/send-otp', account.sendOtp);
router.post('/verify-otp', account.verifyOtp);
router.post('/forgot-password', account.forgotPassword);
router.post('/reset-password', account.resetPassword);
router.patch('/me', protect, account.updateMe);
router.delete('/me', protect, account.deleteMe);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/support', protect, require('../controllers/authController').getSupport);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id/ban', protect, admin, toggleUserBan);

module.exports = router;
