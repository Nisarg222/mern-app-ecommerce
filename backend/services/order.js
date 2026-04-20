const Order   = require('../models/Order');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const { generateOrderId, getPaginationMeta } = require('../utils/helpers');

const TAX_RATE         = 0.18; // 18 % GST
const FREE_SHIPPING_AT = 500;  // free shipping above ₹500
const SHIPPING_COST    = 50;

const createOrder = async (userId, { shippingAddress, paymentMethod = 'cod', notes = '' }) => {
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty.');

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive || product.deletedAt) {
        throw new ApiError(400, `Product "${product?.name ?? 'unknown'}" is no longer available.`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for "${product.name}". Available: ${product.stock}.`);
      }

      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0]?.url ?? '',
        price:    product.price,
        quantity: item.quantity,
        variant:  item.variant,
      });
      subtotal += product.price * item.quantity;
    }

    const shippingCost = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_COST;
    const discount     = cart.discount ?? 0;
    const tax          = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total        = subtotal + shippingCost + tax - discount;

    const order = await Order.create({
      orderId: generateOrderId(),
      user:    userId,
      items:   orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      notes,
      statusHistory: [{ status: 'pending', note: 'Order placed successfully.' }],
    });

    // Deduct stock for each product
    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
      )
    );

    // Clear the cart
    await Cart.findByIdAndDelete(cart._id);

    return order.populate('items.product', 'name images');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to create order.');
  }
};

const getUserOrders = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: userId, deletedAt: null }).sort('-createdAt').skip(skip).limit(limit),
      Order.countDocuments({ user: userId, deletedAt: null }),
    ]);
    return { orders, meta: getPaginationMeta(total, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch orders.');
  }
};

const getOrderById = async (orderId, userId = null) => {
  try {
    const query = { _id: orderId, deletedAt: null };
    if (userId) query.user = userId;

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    if (!order) throw new ApiError(404, 'Order not found.');
    return order;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch order.');
  }
};

const updateOrderStatus = async (orderId, newStatus, note = '') => {
  try {
    const order = await Order.findOne({ _id: orderId, deletedAt: null });
    if (!order) throw new ApiError(404, 'Order not found.');

    const validTransitions = {
      pending:    ['confirmed', 'cancelled'],
      confirmed:  ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped:    ['delivered'],
      delivered:  ['returned'],
      cancelled:  [],
      returned:   [],
    };

    if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot change status from "${order.orderStatus}" to "${newStatus}".`
      );
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({ status: newStatus, note, timestamp: new Date() });
    if (newStatus === 'delivered') order.deliveredAt = new Date();
    if (newStatus === 'cancelled') order.cancelledAt = new Date();

    await order.save();
    return order;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to update order status.');
  }
};

const getAllOrders = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip  = (page - 1) * limit;
    const query = { deletedAt: null, ...filters };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);
    return { orders, meta: getPaginationMeta(total, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Failed to fetch orders.');
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders };
