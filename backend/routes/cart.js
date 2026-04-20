const express = require('express');
const router  = express.Router();

const cartController = require('../controllers/cart');
const { protect }    = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

router.get('/',                    cartController.getCart);
router.post('/items',              cartController.addToCart);
router.put('/items/:itemId',       cartController.updateCartItem);
router.delete('/items/:itemId',    cartController.removeCartItem);
router.delete('/',                 cartController.clearCart);

module.exports = router;
