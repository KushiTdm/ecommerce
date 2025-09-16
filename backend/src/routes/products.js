// backend/src/routes/products.js
const express = require('express');
const { validateQuery, schemas } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const productController = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/', 
  validateQuery(schemas.productQuery), 
  optionalAuth,
  asyncHandler(productController.getProducts)
);

router.get('/featured', 
  asyncHandler(productController.getFeaturedProducts)
);

router.get('/search', 
  asyncHandler(productController.searchProducts)
);

router.get('/categories', 
  asyncHandler(productController.getCategories)
);

router.get('/category/:category', 
  validateQuery(schemas.productQuery), 
  asyncHandler(productController.getProductsByCategory)
);

router.get('/:id', 
  asyncHandler(productController.getProductById)
);

router.get('/:id/reviews', 
  asyncHandler(productController.getProductReviews)
);

router.get('/:id/related', 
  asyncHandler(productController.getRelatedProducts)
);

module.exports = router;