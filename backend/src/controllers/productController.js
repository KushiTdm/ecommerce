// backend/src/controllers/productController.js
const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse, parsePagination, createPaginationMeta } = require('../utils/helpers');

const getProducts = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      category: req.query.category,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset
    };

    const { data: products, count } = await supabaseService.getProducts(filters);

    const meta = createPaginationMeta(page, limit, count || products.length);

    res.json(
      createResponse(true, products, null, meta)
    );

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch products')
    );
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await supabaseService.getProductById(id);

    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    res.json(
      createResponse(true, product)
    );

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch product')
    );
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await supabaseService.getCategories();

    res.json(
      createResponse(true, categories)
    );

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch categories')
    );
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json(
        createResponse(false, null, 'Search query must be at least 2 characters')
      );
    }

    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      search: query.trim(),
      limit,
      offset,
      sortBy: req.query.sortBy || 'name',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const { data: products, count } = await supabaseService.getProducts(filters);

    const meta = createPaginationMeta(page, limit, count || products.length);

    res.json(
      createResponse(true, products, null, meta)
    );

  } catch (error) {
    logger.error('Search products error:', error);
    res.status(500).json(
      createResponse(false, null, 'Search failed')
    );
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const filters = {
      featured: true,
      limit: parseInt(limit),
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    const { data: products } = await supabaseService.getProducts(filters);

    res.json(
      createResponse(true, products)
    );

  } catch (error) {
    logger.error('Get featured products error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch featured products')
    );
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      category,
      limit,
      offset,
      sortBy: req.query.sortBy || 'name',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const { data: products, count } = await supabaseService.getProducts(filters);

    if (!products || products.length === 0) {
      return res.status(404).json(
        createResponse(false, null, 'No products found in this category')
      );
    }

    const meta = createPaginationMeta(page, limit, count || products.length);

    res.json(
      createResponse(true, products, null, meta)
    );

  } catch (error) {
    logger.error('Get products by category error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch products')
    );
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, offset } = parsePagination(req.query);
    
    // This would need to be implemented in supabaseService
    // For now, we'll get the product with reviews
    const product = await supabaseService.getProductById(id);

    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    const reviews = product.reviews || [];
    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    const meta = createPaginationMeta(page, limit, reviews.length);

    res.json(
      createResponse(true, paginatedReviews, null, meta)
    );

  } catch (error) {
    logger.error('Get product reviews error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch reviews')
    );
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    const product = await supabaseService.getProductById(id);

    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    const filters = {
      category: product.category?.slug,
      limit: parseInt(limit) + 1, // Get one extra to exclude current product
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    const { data: products } = await supabaseService.getProducts(filters);
    
    // Remove the current product from results
    const relatedProducts = products.filter(p => p.id !== id).slice(0, parseInt(limit));

    res.json(
      createResponse(true, relatedProducts)
    );

  } catch (error) {
    logger.error('Get related products error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch related products')
    );
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  searchProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductReviews,
  getRelatedProducts
};