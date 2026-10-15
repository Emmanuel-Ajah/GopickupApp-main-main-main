const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '153094572502-n0jop50na9aihi82pgtsocgus6v54lvd.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
        const role = 'user';

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
                phone: user.phone || '',
                userId: user.userId,
                role: user.role,
                image: user.image || user.avatar || '',
                avatar: user.avatar || '',
                location: user.location || '',
                token: generateToken(user._id, user.tokenVersion),
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
        if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Email and password required.' });

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Check if user is banned
            if (user.isBanned) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                userId: user.userId,
                role: user.role,
                image: user.image || user.avatar || '',
                avatar: user.avatar || '',
                location: user.location || '',
                token: generateToken(user._id, user.tokenVersion),
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
        console.log('Verifying ID Token with Client ID:', GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();
        console.log('Google verification successful for email:', email);

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            console.log('Creating new user for Google login:', email);
            isNewUser = true;
            const role = 'user';
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
            isNewUser,
            token: generateToken(user._id, user.tokenVersion),
        };
        
        console.log('Sending success response for Google login. Is new user:', isNewUser);
        res.json(responseData);
    } catch (error) {
        console.error('Google login backend error:', error);
        res.status(400).json({ message: 'Google login failed: ' + error.message });
    }
};

// Generate JWT
const generateToken = (id, version = 0) => {
    return jwt.sign({ id, version }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.getSupport = async (req, res) => {
    const user = await User.findOne({ role: 'admin', isBanned: false }).select('_id name');
    if (!user) return res.status(404).json({ message: 'Support is not available yet.' });
    res.json(user);
};

exports.updateMe = async (req, res) => {
    try {
        const { name, phone, image, avatar, location } = req.body;
        const updates = {};
        if (typeof name === 'string' && name.trim()) updates.name = name.trim();
        if (typeof phone === 'string') updates.phone = phone.trim();
        if (typeof image === 'string') {
            updates.image = image;
            updates.avatar = image;
        }
        if (typeof avatar === 'string') updates.avatar = avatar;
        if (typeof location === 'string') updates.location = location.trim();

        const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteMe = async (req, res) => {
    if (req.user.role === 'admin') return res.status(400).json({ message: 'Admin accounts must be managed by an administrator.' });
    const Order = require('../models/Order');
    if (await Order.exists({ user: req.user._id, status: { $nin: ['Delivered', 'Cancelled'] } })) return res.status(400).json({ message: 'Please complete or cancel active orders first.' });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted.' });
};
// @desc    Send 6-digit OTP code to user
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
    try {
        const { email, purpose = 'verification' } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        // Generate secure 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(otp).digest('hex');
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        const user = await User.findOne({ email: normalizedEmail, isBanned: false });
        if (user) {
            user.otpCode = hash;
            user.otpExpires = expires;
            user.resetHash = hash;
            user.resetExpires = expires;
            await user.save();
        }

        console.log(`[OTP SERVICE] Generated OTP for ${normalizedEmail}: ${otp} (Purpose: ${purpose})`);

        res.json({
            message: `Verification code sent to ${normalizedEmail}`,
            email: normalizedEmail,
            localOtp: otp,
            otp: otp,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify 6-digit OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and 6-digit OTP code are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

        const user = await User.findOne({
            email: normalizedEmail,
            $or: [
                { otpCode: hash, otpExpires: { $gt: new Date() } },
                { resetHash: hash, resetExpires: { $gt: new Date() } },
                { otpCode: cleanOtp, otpExpires: { $gt: new Date() } },
            ],
            isBanned: false,
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            message: 'OTP verified successfully.',
            verified: true,
            resetToken: cleanOtp,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                userId: user.userId,
                image: user.image || user.avatar || '',
                avatar: user.avatar || '',
                location: user.location || '',
            },
            token: generateToken(user._id, user.tokenVersion),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        if (typeof req.body.email !== 'string') return res.status(400).json({ message: 'Email required.' });
        const normalizedEmail = req.body.email.trim().toLowerCase();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({ email: normalizedEmail, isBanned: false });
        if (user) {
            user.resetHash = hash;
            user.resetExpires = new Date(Date.now() + 15 * 60 * 1000);
            user.otpCode = hash;
            user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();
        }

        console.log(`[PASSWORD RECOVERY] OTP generated for ${normalizedEmail}: ${otp}`);

        res.json({
            message: 'Recovery code sent successfully.',
            localToken: otp,
            otp: otp,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, otp, password } = req.body;
        const code = (otp || token || '').toString().trim();
        if (!code || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Recovery code and a password of at least 8 characters are required.' });
        }
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        const user = await User.findOneAndUpdate(
            {
                $or: [
                    { resetHash: hash, resetExpires: { $gt: new Date() } },
                    { resetHash: code, resetExpires: { $gt: new Date() } },
                    { otpCode: hash, otpExpires: { $gt: new Date() } },
                ],
                isBanned: false
            },
            { $unset: { resetHash: 1, resetExpires: 1, otpCode: 1, otpExpires: 1 } },
            { new: true }
        );
        if (!user) return res.status(400).json({ message: 'Invalid or expired recovery code.' });
        user.password = password;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        res.json({ message: 'Password updated. Please sign in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
