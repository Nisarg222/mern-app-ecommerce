const ApiError = require('../utils/ApiError');

/**
 * Restrict route to admin users only.
 * Must be used AFTER the `protect` middleware.
 */
const isAdmin = (req, _res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new ApiError(403, 'Access denied. Admins only.'));
};

module.exports = { isAdmin };
