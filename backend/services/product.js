const Product  = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const { getPaginationMeta } = require('../utils/helpers');

const getProducts = async (filters = {}, page = 1, limit = 12, sort = '-createdAt') => {
  try {
    const query = { isActive: true, deletedAt: null, ...filters };
    const skip  = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return { products, meta: getPaginationMeta(total, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch products.');
  }
};

const getFeaturedProducts = async (limit = 8) => {
  try {
    return await Product.find({ isFeatured: true, isActive: true, deletedAt: null })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(limit);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch featured products.');
  }
};

const getProductBySlug = async (slug) => {
  try {
    const product = await Product.findOne({ slug, isActive: true, deletedAt: null })
      .populate('category', 'name slug');
    if (!product) throw new ApiError(404, 'Product not found.');
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch product.');
  }
};

const getProductById = async (id) => {
  try {
    const product = await Product.findOne({ _id: id, deletedAt: null })
      .populate('category', 'name slug');
    if (!product) throw new ApiError(404, 'Product not found.');
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch product.');
  }
};

const createProduct = async (data, imageFilenames = []) => {
  try {
    const category = await Category.findById(data.category);
    if (!category) throw new ApiError(400, 'Category not found.');

    const images = imageFilenames.map((filename, i) => ({
      url: `/uploads/products/${filename}`,
      isMain: i === 0,
    }));

    const product = await Product.create({ ...data, images });
    return product.populate('category', 'name slug');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to create product.');
  }
};

const updateProduct = async (id, data, newImageFilenames = []) => {
  try {
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) throw new ApiError(404, 'Product not found.');

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw new ApiError(400, 'Category not found.');
    }

    if (newImageFilenames.length > 0) {
      const newImages = newImageFilenames.map((filename, i) => ({
        url: `/uploads/products/${filename}`,
        isMain: i === 0,
      }));
      data.images = [...(product.images || []), ...newImages];
    }

    Object.assign(product, data);
    await product.save();
    return product.populate('category', 'name slug');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to update product.');
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) throw new ApiError(404, 'Product not found.');

    product.deletedAt = new Date();
    product.isActive  = false;
    await product.save();
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to delete product.');
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
