// backend/src/middleware/validation.js
const Joi = require('joi');
const { createResponse } = require('../utils/helpers');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json(
        createResponse(false, null, errorMessage)
      );
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json(
        createResponse(false, null, errorMessage)
      );
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().min(2).max(100).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Product schemas
  productQuery: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    category: Joi.string().optional(),
    search: Joi.string().optional(),
    featured: Joi.boolean().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('name', 'price', 'created_at').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  }),

  // Cart schemas
  addToCart: Joi.object({
    product_id: Joi.string().uuid().required(),
    variant_id: Joi.string().uuid().optional(),
    quantity: Joi.number().integer().min(1).required()
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().integer().min(0).required()
  }),

  // Order schemas
  createOrder: Joi.object({
    shipping_address: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address_line_1: Joi.string().required(),
      address_line_2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().optional()
    }).required(),
    billing_address: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address_line_1: Joi.string().required(),
      address_line_2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().optional()
    }).optional(),
    payment_method: Joi.string().valid('card', 'paypal').optional(),
    notes: Joi.string().max(500).optional()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required()
  }),

  // Payment schemas
  createPaymentIntent: Joi.object({
    order_id: Joi.string().uuid().required()
  }),

  confirmPayment: Joi.object({
    payment_intent_id: Joi.string().required()
  }),

  // User schemas
  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    avatar_url: Joi.string().uri().optional()
  }),

  // Review schemas
  createReview: Joi.object({
    product_id: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(100).optional(),
    comment: Joi.string().max(1000).optional()
  })
};

module.exports = {
  validate,
  validateQuery,
  schemas
};