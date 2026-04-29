const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const registerUser = async ({ name, email, password }) => {
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing)
      throw new ApiError(400, "An account with this email already exists.");

    const user = await User.create({ name, email, password });
    const token = generateToken(user.id);
    return { user, token };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Registration failed.");
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(400, "Invalid email or password.");

    const match = await user.comparePassword(password);
    if (!match) throw new ApiError(400, "Invalid email or password.");

    if (!user.isActive)
      throw new ApiError(403, "Account deactivated. Please contact support.");

    const token = generateToken(user.id);
    return { user, token };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Login failed.");
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      throw new ApiError(404, "No account found with that email address.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ hooks: false }); // skip password re-hash hook
    return resetToken;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      500,
      err.message || "Could not process forgot-password request.",
    );
  }
};

const resetPassword = async (rawToken, newPassword) => {
  try {
    const { Op } = require("sequelize");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashed,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });
    if (!user)
      throw new ApiError(400, "Reset token is invalid or has expired.");

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    const token = generateToken(user.id);
    return { user, token };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Password reset failed.");
  }
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
