const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, dob, bvn } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if this should be an admin
        const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            dob,
            bvn,
            role,
            userId: 'USER' + Math.floor(10000000 + Math.random() * 90000000), // Random ID matching mockup format
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userId: user.userId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Check if user is banned
            if (user.isBanned) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            // Hotfix: Ensure user has admin role if their email matches ADMIN_EMAIL
            if (user.email === process.env.ADMIN_EMAIL && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userId: user.userId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user ban status (Admin only)
// @route   PATCH /api/auth/users/:id/ban
// @access  Private/Admin
exports.toggleUserBan = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    console.log('Received Google Login request');

    if (!idToken) {
        return res.status(400).json({ message: 'No ID Token provided' });
    }

    try {
        console.log('Verifying ID Token with Client ID:', process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();
        console.log('Google verification successful for email:', email);

        let user = await User.findOne({ email });

        if (!user) {
            console.log('Creating new user for Google login:', email);
            const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
            user = await User.create({
                name,
                email,
                avatar: picture,
                googleId: sub,
                role,
                userId: 'USER' + Math.floor(10000000 + Math.random() * 90000000),
                password: Math.random().toString(36).slice(-8),
            });
        } else {
            console.log('Existing user found for Google login:', email);
            // Link Google ID if not already linked
            if (!user.googleId) {
                console.log('Linking Google ID to existing user account');
                user.googleId = sub;
                if (picture && !user.avatar) user.avatar = picture;
                await user.save();
            }
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
        }

        const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            userId: user.userId,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        };
        
        console.log('Sending success response for Google login');
        res.json(responseData);
    } catch (error) {
        console.error('Google login backend error:', error);
        res.status(400).json({ message: 'Google login failed: ' + error.message });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
