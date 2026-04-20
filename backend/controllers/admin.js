const User     = require('../models/User');
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const Category = require('../models/Category');
const productService = require('../services/product');
const orderService   = require('../services/order');
const ApiResponse    = require('../utils/ApiResponse');
const ApiError       = require('../utils/ApiError');
const { getPaginationMeta } = require('../utils/helpers');

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, deletedAt: null }),
      Order.countDocuments({ deletedAt: null }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const recentOrders = await Order.find({ deletedAt: null })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json(new ApiResponse(200, {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenueAgg[0]?.total ?? 0,
      },
      recentOrders,
    }));
  } catch (err) {
    next(err);
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json(new ApiResponse(200, { users, meta: getPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!user) throw new ApiError(404, 'User not found.');
    res.status(200).json(new ApiResponse(200, { user }, 'User status updated.'));
  } catch (err) {
    next(err);
  }
};

// ─── Products ─────────────────────────────────────────────────────────────────

// GET /api/admin/products
exports.getAdminProducts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ deletedAt: null })
        .populate('category', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ deletedAt: null }),
    ]);

    res.status(200).json(new ApiResponse(200, { products, meta: getPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];
    const product = await productService.createProduct(req.body, imageFilenames);
    res.status(201).json(new ApiResponse(201, { product }, 'Product created.'));
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];
    const product = await productService.updateProduct(req.params.id, req.body, imageFilenames);
    res.status(200).json(new ApiResponse(200, { product }, 'Product updated.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Product deleted.'));
  } catch (err) {
    next(err);
  }
};

// ─── Categories ───────────────────────────────────────────────────────────────

// GET /api/admin/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ deletedAt: null }).sort('name');
    res.status(200).json(new ApiResponse(200, { categories }));
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(new ApiResponse(201, { category }, 'Category created.'));
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Category not found.');
    res.status(200).json(new ApiResponse(200, { category }, 'Category updated.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found.');
    category.deletedAt = new Date();
    category.isActive  = false;
    await category.save();
    res.status(200).json(new ApiResponse(200, null, 'Category deleted.'));
  } catch (err) {
    next(err);
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const page    = parseInt(req.query.page,  10) || 1;
    const limit   = parseInt(req.query.limit, 10) || 20;
    const filters = {};
    if (req.query.status) filters.orderStatus = req.query.status;

    const result = await orderService.getAllOrders(page, limit, filters);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json(new ApiResponse(200, { order }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, note);
    res.status(200).json(new ApiResponse(200, { order }, 'Order status updated.'));
  } catch (err) {
    next(err);
  }
};
