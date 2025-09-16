const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', 
  validate(schemas.register), 
  asyncHandler(authController.register)
);

router.post('/login', 
  validate(schemas.login), 
  asyncHandler(authController.login)
);

router.post('/logout', 
  asyncHandler(authController.logout)
);

router.post('/refresh-token', 
  asyncHandler(authController.refreshToken)
);

router.post('/forgot-password', 
  asyncHandler(authController.forgotPassword)
);

router.post('/reset-password', 
  asyncHandler(authController.resetPassword)
);

// Protected routes
router.get('/profile', 
  authenticateToken, 
  asyncHandler(authController.getProfile)
);

router.put('/profile', 
  authenticateToken, 
  validate(schemas.updateProfile), 
  asyncHandler(authController.updateProfile)
);

module.exports = router;