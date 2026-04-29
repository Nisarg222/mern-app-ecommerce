const { User, Product, Order, Category } = require("../models");
const productService = require("../services/product");
const orderService = require("../services/order");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { getPaginationMeta } = require("../utils/helpers");

// ─── Dashboard ────────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue] = await Promise.all(
      [
        User.count({ where: { isActive: true } }),
        Product.count({ where: { isActive: true, deletedAt: null } }),
        Order.count({ where: { deletedAt: null } }),
        Order.sum("total", {
          where: { paymentStatus: "paid", deletedAt: null },
        }),
      ],
    );

    const recentOrders = await Order.findAll({
      where: { deletedAt: null },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.status(200).json(
      new ApiResponse(200, {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          revenue: revenue ?? 0,
        },
        recentOrders,
      }),
    );
  } catch (err) {
    next(err);
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    res.status(200).json(
      new ApiResponse(200, {
        users,
        meta: getPaginationMeta(count, page, limit),
      }),
    );
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const [updated] = await User.update(
      { isActive: req.body.isActive },
      { where: { id: req.params.id } },
    );
    if (!updated) throw new ApiError(404, "User not found.");
    const user = await User.findByPk(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, { user }, "User status updated."));
  } catch (err) {
    next(err);
  }
};

// ─── Products ─────────────────────────────────────────────────────────────────

exports.getAdminProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const {
      ProductImage,
      ProductVariant,
      Category: Cat,
    } = require("../models");

    const { count, rows: products } = await Product.findAndCountAll({
      where: { deletedAt: null },
      include: [
        { model: Cat, as: "category", attributes: ["id", "name"] },
        { model: ProductImage, as: "images" },
        { model: ProductVariant, as: "variants" },
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
      distinct: true,
    });

    res.status(200).json(
      new ApiResponse(200, {
        products,
        meta: getPaginationMeta(count, page, limit),
      }),
    );
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];
    const product = await productService.createProduct(
      req.body,
      imageFilenames,
    );
    res.status(201).json(new ApiResponse(201, { product }, "Product created."));
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      imageFilenames,
    );
    res.status(200).json(new ApiResponse(200, { product }, "Product updated."));
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Product deleted."));
  } catch (err) {
    next(err);
  }
};

// ─── Categories ───────────────────────────────────────────────────────────────

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { deletedAt: null },
      order: [["name", "ASC"]],
    });
    res.status(200).json(new ApiResponse(200, { categories }));
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;
    const category = await Category.create({
      name,
      description,
      image,
      isActive,
    });
    res
      .status(201)
      .json(new ApiResponse(201, { category }, "Category created."));
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new ApiError(404, "Category not found.");
    await category.update(req.body);
    res
      .status(200)
      .json(new ApiResponse(200, { category }, "Category updated."));
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new ApiError(404, "Category not found.");
    await category.update({ deletedAt: new Date(), isActive: false });
    res.status(200).json(new ApiResponse(200, null, "Category deleted."));
  } catch (err) {
    next(err);
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filters = {};
    if (req.query.status) filters.orderStatus = req.query.status;

    const result = await orderService.getAllOrders(page, limit, filters);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json(new ApiResponse(200, { order }));
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      note,
    );
    res
      .status(200)
      .json(new ApiResponse(200, { order }, "Order status updated."));
  } catch (err) {
    next(err);
  }
};
