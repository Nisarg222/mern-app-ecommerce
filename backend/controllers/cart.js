const Cart     = require('../models/Cart');
const Product  = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const ApiError    = require('../utils/ApiError');

// Populate helper — reused after every mutation
const populatedCart = (cartId) =>
  Cart.findById(cartId).populate('items.product', 'name price images stock isActive');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images stock isActive');
  if (!cart) {
    const created = await Cart.create({ user: userId, items: [] });
    cart = await populatedCart(created._id);
  }
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.status(200).json(new ApiResponse(200, { cart }));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    if (!productId) throw new ApiError(400, 'productId is required.');

    const product = await Product.findOne({ _id: productId, isActive: true, deletedAt: null });
    if (!product) throw new ApiError(404, 'Product not found.');
    if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant ?? {})
    );

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + Number(quantity);
      if (product.stock < newQty) throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), price: product.price, variant });
    }

    await cart.save();
    const updated = await populatedCart(cart._id);
    res.status(200).json(new ApiResponse(200, { cart: updated }, 'Item added to cart.'));
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/items/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) throw new ApiError(400, 'Quantity must be at least 1.');

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart not found.');

    const item = cart.items.id(req.params.itemId);
    if (!item) throw new ApiError(404, 'Cart item not found.');

    const product = await Product.findById(item.product);
    if (!product) throw new ApiError(404, 'Product no longer exists.');
    if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} item(s) in stock.`);

    item.quantity = Number(quantity);
    await cart.save();

    const updated = await populatedCart(cart._id);
    res.status(200).json(new ApiResponse(200, { cart: updated }, 'Cart updated.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart not found.');

    const before = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    if (cart.items.length === before) throw new ApiError(404, 'Cart item not found.');

    await cart.save();
    const updated = await populatedCart(cart._id);
    res.status(200).json(new ApiResponse(200, { cart: updated }, 'Item removed from cart.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json(new ApiResponse(200, null, 'Cart cleared.'));
  } catch (err) {
    next(err);
  }
};
