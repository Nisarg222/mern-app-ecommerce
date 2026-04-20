const authService = require('../services/auth');
const User        = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError    = require('../utils/ApiError');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json(new ApiResponse(201, { user, token }, 'Registration successful.'));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful.'));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, { user: req.user }));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    // In production, send an email containing this URL instead of returning it
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    res.status(200).json(
      new ApiResponse(200, { resetUrl }, 'Password reset link generated. Check your email.')
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { user, token } = await authService.resetPassword(req.params.token, req.body.password);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json(new ApiResponse(200, { user, token }, 'Password reset successful.'));
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, phone, avatar } },
      { new: true, runValidators: true }
    );
    res.status(200).json(new ApiResponse(200, { user }, 'Profile updated.'));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(new ApiResponse(201, { addresses: user.addresses }, 'Address added.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const before = user.addresses.length;
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);

    if (user.addresses.length === before) throw new ApiError(404, 'Address not found.');

    await user.save();
    res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, 'Address removed.'));
  } catch (err) {
    next(err);
  }
};
