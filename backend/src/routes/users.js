const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const userController = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', 
  asyncHandler(userController.getProfile)
);

router.put('/profile', 
  validate(schemas.updateProfile), 
  asyncHandler(userController.updateProfile)
);

router.get('/stats', 
  asyncHandler(userController.getUserStats)
);

// Wishlist routes
router.get('/wishlist', 
  asyncHandler(userController.getWishlist)
);

router.post('/wishlist', 
  asyncHandler(userController.addToWishlist)
);

router.delete('/wishlist/:productId', 
  asyncHandler(userController.removeFromWishlist)
);

// Address routes
router.get('/addresses', 
  asyncHandler(userController.getAddresses)
);

router.post('/addresses', 
  asyncHandler(userController.addAddress)
);

router.put('/addresses/:addressId', 
  asyncHandler(userController.updateAddress)
);

router.delete('/addresses/:addressId', 
  asyncHandler(userController.deleteAddress)
);

// Review routes
router.post('/reviews', 
  validate(schemas.createReview), 
  asyncHandler(userController.createReview)
);

module.exports = router;