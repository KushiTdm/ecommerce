const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const orderController = require('../controllers/orderController');

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

router.post('/', 
  validate(schemas.createOrder), 
  asyncHandler(orderController.createOrder)
);

router.get('/', 
  asyncHandler(orderController.getUserOrders)
);

router.get('/summary', 
  asyncHandler(orderController.getOrderSummary)
);

router.get('/:orderId', 
  asyncHandler(orderController.getOrderById)
);

router.get('/:orderId/track', 
  asyncHandler(orderController.trackOrder)
);

router.post('/:orderId/reorder', 
  asyncHandler(orderController.reorderItems)
);

router.put('/:orderId/cancel', 
  asyncHandler(orderController.cancelOrder)
);

// Admin only routes
router.put('/:orderId/status', 
  requireAdmin,
  validate(schemas.updateOrderStatus), 
  asyncHandler(orderController.updateOrderStatus)
);

module.exports = router;