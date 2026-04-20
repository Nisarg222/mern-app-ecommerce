const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const registerUser = async ({ name, email, password }) => {
  try {
    const existing = await User.findOne({ email });
    if (existing)
      throw new ApiError(400, "An account with this email already exists.");

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    return { user, token };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Registration failed.");
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new ApiError(400, "Invalid email or password.");

    const match = await user.comparePassword(password);
    if (!match) throw new ApiError(400, "Invalid email or password.");

    if (!user.isActive)
      throw new ApiError(403, "Account deactivated. Please contact support.");

    const token = generateToken(user._id);
    return { user, token };
  } catch (err) {
    console.log("Error1:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Login failed.");
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user)
      throw new ApiError(404, "No account found with that email address.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    return resetToken; // caller is responsible for emailing this
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
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user)
      throw new ApiError(400, "Reset token is invalid or has expired.");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
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
