const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, toggleUserBan, googleLogin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id/ban', protect, admin, toggleUserBan);

module.exports = router;
