const productService = require("../services/product");
const { Category } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { parseQueryFilters } = require("../utils/helpers");

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { filters, page, limit, sort } = parseQueryFilters(req.query);
    const result = await productService.getProducts(filters, page, limit, sort);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts(8);
    res.status(200).json(new ApiResponse(200, { products }));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true, deletedAt: null },
      order: [["name", "ASC"]],
    });
    res.status(200).json(new ApiResponse(200, { categories }));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories/:slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug, isActive: true, deletedAt: null },
    });
    if (!category) throw new ApiError(404, "Category not found.");
    res.status(200).json(new ApiResponse(200, { category }));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json(new ApiResponse(200, { product }));
  } catch (err) {
    next(err);
  }
};
