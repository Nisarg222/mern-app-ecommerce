const { Op } = require("sequelize");
const {
  Product,
  Category,
  ProductImage,
  ProductVariant,
} = require("../models");
const ApiError = require("../utils/ApiError");
const { getPaginationMeta } = require("../utils/helpers");

// Convert '-createdAt' → [['createdAt', 'DESC']]
const parseSort = (sort = "-createdAt") => {
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [[field, desc ? "DESC" : "ASC"]];
};

const PRODUCT_INCLUDES = [
  { model: Category, as: "category", attributes: ["id", "name", "slug"] },
  { model: ProductImage, as: "images" },
  { model: ProductVariant, as: "variants" },
];

const getProducts = async (
  filters = {},
  page = 1,
  limit = 12,
  sort = "-createdAt",
) => {
  try {
    const where = { isActive: true, deletedAt: null };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }
    if (filters.category) where.categoryId = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    const offset = (page - 1) * limit;
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: PRODUCT_INCLUDES,
      order: parseSort(sort),
      offset,
      limit,
      distinct: true,
    });

    return { products, meta: getPaginationMeta(count, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch products.");
  }
};

const getFeaturedProducts = async (limit = 8) => {
  try {
    return await Product.findAll({
      where: { isFeatured: true, isActive: true, deletedAt: null },
      include: PRODUCT_INCLUDES,
      order: [["createdAt", "DESC"]],
      limit,
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      500,
      err.message || "Failed to fetch featured products.",
    );
  }
};

const getProductBySlug = async (slug) => {
  try {
    const product = await Product.findOne({
      where: { slug, isActive: true, deletedAt: null },
      include: PRODUCT_INCLUDES,
    });
    if (!product) throw new ApiError(404, "Product not found.");
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch product.");
  }
};

const getProductById = async (id) => {
  try {
    const product = await Product.findOne({
      where: { id, deletedAt: null },
      include: PRODUCT_INCLUDES,
    });
    if (!product) throw new ApiError(404, "Product not found.");
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch product.");
  }
};

const createProduct = async (data, imageFilenames = []) => {
  try {
    const category = await Category.findByPk(data.categoryId || data.category);
    if (!category) throw new ApiError(400, "Category not found.");

    const productData = {
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription || "",
      price: data.price,
      comparePrice: data.comparePrice || 0,
      categoryId: data.categoryId || data.category,
      stock: data.stock || 0,
      sku: data.sku || null,
      brand: data.brand || "",
      tags: data.tags
        ? Array.isArray(data.tags)
          ? data.tags
          : JSON.parse(data.tags)
        : [],
      isFeatured: data.isFeatured === "true" || data.isFeatured === true,
      isActive: data.isActive !== "false" && data.isActive !== false,
    };

    const product = await Product.create(productData);

    // Create image records
    if (imageFilenames.length > 0) {
      const images = imageFilenames.map((filename, i) => ({
        productId: product.id,
        url: `/uploads/products/${filename}`,
        isMain: i === 0,
      }));
      await ProductImage.bulkCreate(images);
    }

    // Create variant records
    if (data.variants) {
      const variants = Array.isArray(data.variants)
        ? data.variants
        : JSON.parse(data.variants);
      const variantRows = variants.map((v) => ({
        ...v,
        productId: product.id,
      }));
      await ProductVariant.bulkCreate(variantRows);
    }

    return getProductById(product.id);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to create product.");
  }
};

const updateProduct = async (id, data, newImageFilenames = []) => {
  try {
    const product = await Product.findOne({ where: { id, deletedAt: null } });
    if (!product) throw new ApiError(404, "Product not found.");

    if (data.categoryId || data.category) {
      const catId = data.categoryId || data.category;
      const category = await Category.findByPk(catId);
      if (!category) throw new ApiError(400, "Category not found.");
      data.categoryId = catId;
    }

    if (data.tags && !Array.isArray(data.tags)) {
      data.tags = JSON.parse(data.tags);
    }

    await product.update(data);

    if (newImageFilenames.length > 0) {
      const images = newImageFilenames.map((filename, i) => ({
        productId: product.id,
        url: `/uploads/products/${filename}`,
        isMain: i === 0,
      }));
      await ProductImage.bulkCreate(images);
    }

    return getProductById(product.id);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to update product.");
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await Product.findOne({ where: { id, deletedAt: null } });
    if (!product) throw new ApiError(404, "Product not found.");
    await product.update({ deletedAt: new Date(), isActive: false });
    return product;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to delete product.");
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
