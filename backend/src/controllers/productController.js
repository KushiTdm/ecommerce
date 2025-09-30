// backend/src/controllers/productController.js 
const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse, parsePagination, createPaginationMeta } = require('../utils/helpers');

const getProducts = async (req, res) => {
  try {
    console.log('🎯 ProductController: getProducts called');
    console.log('🎯 Query params:', req.query);
    
    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      category: req.query.category,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc',
      limit,
      offset
    };

    console.log('🔧 Processed filters:', filters);

    const { data: products, count } = await supabaseService.getProducts(filters);

    console.log('✅ Products fetched successfully:', {
      count: products?.length || 0,
      totalCount: count,
      firstProduct: products?.[0]?.name || 'None'
    });

    const meta = createPaginationMeta(page, limit, count || products.length);

    res.json(
      createResponse(true, products, null, meta)
    );

  } catch (error) {
    console.error('❌ ProductController error:', error);
    logger.error('Get products error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch products: ${error.message}`)
    );
  }
};

const getProductById = async (req, res) => {
  try {
    console.log('🎯 ProductController: getProductById called with ID:', req.params.id);
    const { id } = req.params;
    
    const product = await supabaseService.getProductById(id);

    if (!product) {
      console.log('❌ Product not found:', id);
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    console.log('✅ Product fetched successfully:', product.name);
    res.json(
      createResponse(true, product)
    );

  } catch (error) {
    console.error('❌ ProductController getProductById error:', error);
    logger.error('Get product error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch product: ${error.message}`)
    );
  }
};

const getCategories = async (req, res) => {
  try {
    console.log('🎯 ProductController: getCategories called');
    
    const categories = await supabaseService.getCategories();

    console.log('✅ Categories fetched successfully:', categories?.length || 0);
    res.json(
      createResponse(true, categories)
    );

  } catch (error) {
    console.error('❌ ProductController getCategories error:', error);
    logger.error('Get categories error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch categories: ${error.message}`)
    );
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    console.log('🎯 ProductController: getProductsByCategory called');
    console.log('🎯 Category:', req.params.category);
    
    const { category } = req.params;
    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      category,
      limit,
      offset,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc'
    };

    console.log('🔧 Category filters:', filters);

    const { data: products, count } = await supabaseService.getProducts(filters);

    console.log('✅ Products by category result:', {
      category,
      count: products?.length || 0,
      totalCount: count
    });

    const meta = createPaginationMeta(page, limit, count || products.length);

    res.json(
      createResponse(true, products, `Products in category: ${category}`, meta)
    );

  } catch (error) {
    console.error('❌ ProductController getProductsByCategory error:', error);
    logger.error('Get products by category error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch products for category: ${error.message}`)
    );
  }
};

const searchProducts = async (req, res) => {
  try {
    console.log('🎯 ProductController: searchProducts called');
    console.log('🔍 Search query:', req.query.q);
    
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

    console.log('✅ Search completed:', {
      query: query.trim(),
      resultsCount: products?.length || 0
    });

    res.json(
      createResponse(true, products, null, meta)
    );

  } catch (error) {
    console.error('❌ ProductController searchProducts error:', error);
    logger.error('Search products error:', error);
    res.status(500).json(
      createResponse(false, null, `Search failed: ${error.message}`)
    );
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    console.log('🎯 ProductController: getFeaturedProducts called');
    const { limit = 8 } = req.query;
    
    const filters = {
      featured: true,
      limit: parseInt(limit),
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    const { data: products } = await supabaseService.getProducts(filters);

    console.log('✅ Featured products fetched:', products?.length || 0);
    res.json(
      createResponse(true, products)
    );

  } catch (error) {
    console.error('❌ ProductController getFeaturedProducts error:', error);
    logger.error('Get featured products error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch featured products: ${error.message}`)
    );
  }
};

const getProductReviews = async (req, res) => {
  try {
    console.log('🎯 ProductController: getProductReviews called');
    const { id } = req.params;
    const { page, limit, offset } = parsePagination(req.query);
    
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
    console.error('❌ ProductController getProductReviews error:', error);
    logger.error('Get product reviews error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch reviews: ${error.message}`)
    );
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    console.log('🎯 ProductController: getRelatedProducts called');
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    const product = await supabaseService.getProductById(id);

    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    const filters = {
      category: product.category?.slug || product.category?.name,
      limit: parseInt(limit) + 1,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    const { data: products } = await supabaseService.getProducts(filters);
    
    // Remove the current product from results
    const relatedProducts = products.filter(p => p.id !== id).slice(0, parseInt(limit));

    console.log('✅ Related products fetched:', relatedProducts?.length || 0);
    res.json(
      createResponse(true, relatedProducts)
    );

  } catch (error) {
    console.error('❌ ProductController getRelatedProducts error:', error);
    logger.error('Get related products error:', error);
    res.status(500).json(
      createResponse(false, null, `Failed to fetch related products: ${error.message}`)
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