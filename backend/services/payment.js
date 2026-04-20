/**
 * Payment service — mock implementation.
 *
 * Replace `processMockPayment` with real Stripe / Razorpay SDK calls in production:
 *   - Stripe:   stripe.paymentIntents.create(...)
 *   - Razorpay: razorpay.orders.create(...)
 */
const ApiError = require('../utils/ApiError');

const processMockPayment = async ({ amount, currency = 'INR', method = 'stripe' }) => {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 95 % success rate simulation
    if (Math.random() < 0.05) {
      throw new ApiError(402, 'Payment declined. Please try a different payment method.');
    }

    return {
      success:   true,
      paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      amount,
      currency,
      method,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Payment processing failed.');
  }
};

/**
 * Verify a payment by ID.
 * In production this should call the payment provider's API / validate a webhook signature.
 */
const verifyPayment = async (paymentId) => {
  try {
    if (!paymentId) throw new ApiError(400, 'Payment ID is required for verification.');
    // Mock: all provided IDs are considered verified
    return { verified: true, paymentId };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || 'Payment verification failed.');
  }
};

module.exports = { processMockPayment, verifyPayment };
