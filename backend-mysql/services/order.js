const {
  Cart,
  CartItem,
  Product,
  ProductImage,
  Order,
  OrderItem,
  OrderStatusHistory,
  User,
} = require("../models");
const ApiError = require("../utils/ApiError");
const { generateOrderId, getPaginationMeta } = require("../utils/helpers");
const sequelize = require("../config/db");

const TAX_RATE = 0.18;
const FREE_SHIPPING_AT = 500;
const SHIPPING_COST = 50;

const ORDER_INCLUDES = [
  {
    model: User,
    as: "user",
    attributes: ["id", "name", "email"],
  },
  {
    model: OrderItem,
    as: "items",
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name"],
        include: [{ model: ProductImage, as: "images" }],
      },
    ],
  },
  {
    model: OrderStatusHistory,
    as: "statusHistory",
    order: [["timestamp", "ASC"]],
  },
];

const createOrder = async (
  userId,
  { shippingAddress, paymentMethod = "cod", notes = "" },
) => {
  const t = await sequelize.transaction();
  try {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [{ model: ProductImage, as: "images" }],
            },
          ],
        },
      ],
      transaction: t,
    });
    if (!cart || !cart.items.length)
      throw new ApiError(400, "Your cart is empty.");

    const orderItemsData = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive || product.deletedAt) {
        throw new ApiError(
          400,
          `Product "${product?.name ?? "unknown"}" is no longer available.`,
        );
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
        );
      }

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        image: product.images?.[0]?.url ?? "",
        price: product.price,
        quantity: item.quantity,
        variantSize: item.variantSize,
        variantColor: item.variantColor,
      });
      subtotal += Number(product.price) * item.quantity;
    }

    const shippingCost = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_COST;
    const discount = Number(cart.discount) || 0;
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = subtotal + shippingCost + tax - discount;

    const order = await Order.create(
      {
        orderId: generateOrderId(),
        userId,
        shippingLabel: shippingAddress?.label,
        shippingStreet: shippingAddress?.street,
        shippingCity: shippingAddress?.city,
        shippingState: shippingAddress?.state,
        shippingPostalCode: shippingAddress?.postalCode,
        shippingCountry: shippingAddress?.country || "India",
        paymentMethod,
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        notes,
      },
      { transaction: t },
    );

    // Create order items
    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    // Initial status history
    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status: "pending",
        note: "Order placed successfully.",
      },
      { transaction: t },
    );

    // Deduct stock
    for (const item of cart.items) {
      await Product.decrement("stock", {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t,
      });
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    await cart.destroy({ transaction: t });

    await t.commit();

    return Order.findByPk(order.id, { include: ORDER_INCLUDES });
  } catch (err) {
    await t.rollback();
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to create order.");
  }
};

const getUserOrders = async (userId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId, deletedAt: null },
      include: ORDER_INCLUDES,
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      distinct: true,
    });
    return { orders, meta: getPaginationMeta(count, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch orders.");
  }
};

const getOrderById = async (orderId, userId = null) => {
  try {
    const where = { id: orderId, deletedAt: null };
    if (userId) where.userId = userId;

    const order = await Order.findOne({ where, include: ORDER_INCLUDES });
    if (!order) throw new ApiError(404, "Order not found.");
    return order;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch order.");
  }
};

const updateOrderStatus = async (orderId, newStatus, note = "") => {
  try {
    const order = await Order.findOne({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new ApiError(404, "Order not found.");

    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };

    if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot change status from "${order.orderStatus}" to "${newStatus}".`,
      );
    }

    const updates = { orderStatus: newStatus };
    if (newStatus === "delivered") updates.deliveredAt = new Date();
    if (newStatus === "cancelled") updates.cancelledAt = new Date();
    await order.update(updates);

    await OrderStatusHistory.create({
      orderId: order.id,
      status: newStatus,
      note,
      timestamp: new Date(),
    });

    return Order.findByPk(order.id, { include: ORDER_INCLUDES });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to update order status.");
  }
};

const getAllOrders = async (page = 1, limit = 20, filters = {}) => {
  try {
    const where = { deletedAt: null, ...filters };
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: ORDER_INCLUDES,
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      distinct: true,
    });
    return { orders, meta: getPaginationMeta(count, page, limit) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Failed to fetch orders.");
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
