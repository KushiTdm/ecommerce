const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Webhook route (no authentication required)
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.handleWebhook)
);

// Authenticated routes
router.use(authenticateToken);

router.post('/create-intent', 
  validate(schemas.createPaymentIntent), 
  asyncHandler(paymentController.createPaymentIntent)
);

router.post('/confirm', 
  validate(schemas.confirmPayment), 
  asyncHandler(paymentController.confirmPayment)
);

router.get('/methods', 
  asyncHandler(paymentController.getPaymentMethods)
);

router.get('/history', 
  asyncHandler(paymentController.getPaymentHistory)
);

// Admin only routes
router.post('/:orderId/refund', 
  requireAdmin,
  asyncHandler(paymentController.refundPayment)
);

module.exports = router;