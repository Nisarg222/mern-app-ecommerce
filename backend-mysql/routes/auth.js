const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  authController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetPasswordValidator,
  validate,
  authController.resetPassword,
);

router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.post("/addresses", protect, authController.addAddress);
router.delete("/addresses/:id", protect, authController.deleteAddress);

module.exports = router;
