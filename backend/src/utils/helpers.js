// backend/src/utils/helpers.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Calculate order totals
 */
const calculateOrderTotals = (items, shippingRate = 0, taxRate = 0.08) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.unit_price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 100 ? 0 : shippingRate;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate UUID
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Sanitize user data for response
 */
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

/**
 * Create standardized API response
 */
const createResponse = (success, data = null, error = null, meta = null) => {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  if (meta !== null) response.meta = meta;
  
  return response;
};

/**
 * Parse pagination parameters
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Create pagination metadata
 */
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateOrderNumber,
  calculateOrderTotals,
  formatCurrency,
  isValidEmail,
  generateUUID,
  sanitizeUser,
  createResponse,
  parsePagination,
  createPaginationMeta
};