const express = require('express');
const router  = express.Router();

const productController = require('../controllers/product');

// Static paths must come before dynamic :slug
router.get('/featured',              productController.getFeaturedProducts);
router.get('/categories',            productController.getCategories);
router.get('/categories/:slug',      productController.getCategoryBySlug);

// Product listing & detail
router.get('/',                      productController.getProducts);
router.get('/:slug',                 productController.getProductBySlug);

module.exports = router;
