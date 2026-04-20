const express = require('express');
const router  = express.Router();

const orderController = require('../controllers/order');
const { protect }     = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/',              orderController.createOrder);
router.get('/',               orderController.getMyOrders);
router.get('/:id',            orderController.getOrderById);
router.patch('/:id/cancel',   orderController.cancelOrder);

module.exports = router;
