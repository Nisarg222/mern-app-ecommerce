const orderService = require("../services/order");
const ApiResponse = require("../utils/ApiResponse");

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res
      .status(201)
      .json(new ApiResponse(201, { order }, "Order placed successfully."));
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await orderService.getUserOrders(req.user.id, page, limit);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.status(200).json(new ApiResponse(200, { order }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      "cancelled",
      "Cancelled by customer.",
    );
    res.status(200).json(new ApiResponse(200, { order }, "Order cancelled."));
  } catch (err) {
    next(err);
  }
};
