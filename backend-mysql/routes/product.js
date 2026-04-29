const express = require("express");
const router = express.Router();

const productController = require("../controllers/product");

router.get("/featured", productController.getFeaturedProducts);
router.get("/categories", productController.getCategories);
router.get("/categories/:slug", productController.getCategoryBySlug);
router.get("/", productController.getProducts);
router.get("/:slug", productController.getProductBySlug);

module.exports = router;
