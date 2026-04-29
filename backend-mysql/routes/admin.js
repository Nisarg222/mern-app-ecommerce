const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");
const { upload } = require("../middleware/upload");
const { validate } = require("../middleware/validate");
const {
  createProductValidator,
  updateProductValidator,
} = require("../validators/productValidator");

router.use(protect, isAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users
router.get("/users", adminController.getUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);

// Products
router.get("/products", adminController.getAdminProducts);
router.post(
  "/products",
  upload.array("images", 5),
  createProductValidator,
  validate,
  adminController.createProduct,
);
router.put(
  "/products/:id",
  upload.array("images", 5),
  updateProductValidator,
  validate,
  adminController.updateProduct,
);
router.delete("/products/:id", adminController.deleteProduct);

// Categories
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Orders
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderById);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

module.exports = router;
