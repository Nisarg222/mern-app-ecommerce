const { Cart, CartItem, Product, ProductImage } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const CART_INCLUDE = [
  {
    model: CartItem,
    as: "items",
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "price", "stock", "isActive"],
        include: [{ model: ProductImage, as: "images" }],
      },
    ],
  },
];

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId }, include: CART_INCLUDE });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
    cart = await Cart.findOne({ where: { userId }, include: CART_INCLUDE });
  }
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.status(200).json(new ApiResponse(200, { cart }));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    if (!productId) throw new ApiError(400, "productId is required.");

    const product = await Product.findOne({
      where: { id: productId, isActive: true, deletedAt: null },
    });
    if (!product) throw new ApiError(404, "Product not found.");
    if (product.stock < quantity)
      throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) cart = await Cart.create({ userId: req.user.id });

    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        variantSize: variant?.size || null,
        variantColor: variant?.color || null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (product.stock < newQty)
        throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);
      await existingItem.update({ quantity: newQty });
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: Number(quantity),
        price: product.price,
        variantSize: variant?.size || null,
        variantColor: variant?.color || null,
      });
    }

    const updated = await Cart.findOne({
      where: { userId: req.user.id },
      include: CART_INCLUDE,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { cart: updated }, "Item added to cart."));
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/items/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      throw new ApiError(400, "Quantity must be at least 1.");

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) throw new ApiError(404, "Cart not found.");

    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
    });
    if (!item) throw new ApiError(404, "Cart item not found.");

    const product = await Product.findByPk(item.productId);
    if (!product) throw new ApiError(404, "Product no longer exists.");
    if (product.stock < quantity)
      throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);

    await item.update({ quantity: Number(quantity) });

    const updated = await Cart.findOne({
      where: { userId: req.user.id },
      include: CART_INCLUDE,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { cart: updated }, "Cart updated."));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) throw new ApiError(404, "Cart not found.");

    const deleted = await CartItem.destroy({
      where: { id: req.params.itemId, cartId: cart.id },
    });
    if (!deleted) throw new ApiError(404, "Cart item not found.");

    const updated = await Cart.findOne({
      where: { userId: req.user.id },
      include: CART_INCLUDE,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { cart: updated }, "Item removed from cart."));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
      await cart.destroy();
    }
    res.status(200).json(new ApiResponse(200, null, "Cart cleared."));
  } catch (err) {
    next(err);
  }
};
