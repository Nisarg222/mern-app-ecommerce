const ApiError = require("../utils/ApiError");

const isAdmin = (req, _res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return next(new ApiError(403, "Access denied. Admins only."));
};

module.exports = { isAdmin };
