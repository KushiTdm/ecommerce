const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const cartController = require('../controllers/cartController');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', 
  asyncHandler(cartController.getCart)
);

router.post('/add', 
  validate(schemas.addToCart), 
  asyncHandler(cartController.addToCart)
);

router.put('/:itemId', 
  validate(schemas.updateCartItem), 
  asyncHandler(cartController.updateCartItem)
);

router.delete('/:itemId', 
  asyncHandler(cartController.removeCartItem)
);

router.delete('/', 
  asyncHandler(cartController.clearCart)
);

router.get('/count', 
  asyncHandler(cartController.getCartItemCount)
);

router.get('/validate', 
  asyncHandler(cartController.validateCart)
);

module.exports = router;