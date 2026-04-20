const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Protect routes — verifies JWT from Authorization header or cookie.
 * Attaches `req.user` on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, "Authentication required. Please log in."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, "User not found or account deactivated."));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token."));
    }
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired. Please log in again."));
    }
    next(err);
  }
};

module.exports = { protect };
