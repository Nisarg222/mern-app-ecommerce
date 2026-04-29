const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errs = result.array();
    return next(new ApiError(422, errs[0].msg, errs));
  }
  next();
};

module.exports = { validate };
