const authService = require("../services/auth");
const { User, UserAddress } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
    });
    res.cookie("token", token, COOKIE_OPTIONS);
    res
      .status(201)
      .json(new ApiResponse(201, { user, token }, "Registration successful."));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.cookie("token", token, COOKIE_OPTIONS);
    res
      .status(200)
      .json(new ApiResponse(200, { user, token }, "Login successful."));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (_req, res, next) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully."));
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: UserAddress, as: "addresses" }],
    });
    res.status(200).json(new ApiResponse(200, { user }));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { resetUrl },
          "Password reset link generated. Check your email.",
        ),
      );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { user, token } = await authService.resetPassword(
      req.params.token,
      req.body.password,
    );
    res.cookie("token", token, COOKIE_OPTIONS);
    res
      .status(200)
      .json(
        new ApiResponse(200, { user, token }, "Password reset successful."),
      );
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByPk(req.user.id);
    await user.update({ name, phone, avatar });
    res.status(200).json(new ApiResponse(200, { user }, "Profile updated."));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await UserAddress.update(
        { isDefault: false },
        { where: { userId: req.user.id } },
      );
    }
    await UserAddress.create({ ...req.body, userId: req.user.id });
    const addresses = await UserAddress.findAll({
      where: { userId: req.user.id },
    });
    res.status(201).json(new ApiResponse(201, { addresses }, "Address added."));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const deleted = await UserAddress.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!deleted) throw new ApiError(404, "Address not found.");
    const addresses = await UserAddress.findAll({
      where: { userId: req.user.id },
    });
    res
      .status(200)
      .json(new ApiResponse(200, { addresses }, "Address removed."));
  } catch (err) {
    next(err);
  }
};
