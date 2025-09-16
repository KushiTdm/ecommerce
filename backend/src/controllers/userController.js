const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse, sanitizeUser } = require('../utils/helpers');

const getProfile = async (req, res) => {
  try {
    const profile = await supabaseService.getUserProfile(req.user.id);

    if (!profile) {
      return res.status(404).json(
        createResponse(false, null, 'Profile not found')
      );
    }

    res.json(
      createResponse(true, sanitizeUser(profile))
    );

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch profile')
    );
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.id;
    delete updates.email;
    delete updates.created_at;
    delete updates.updated_at;

    const profile = await supabaseService.updateUserProfile(req.user.id, updates);

    logger.info(`Profile updated for user: ${req.user.id}`);

    res.json(
      createResponse(true, sanitizeUser(profile), 'Profile updated successfully')
    );

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to update profile')
    );
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await supabaseService.getWishlistItems(req.user.id);

    res.json(
      createResponse(true, wishlistItems)
    );

  } catch (error) {
    logger.error('Get wishlist error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch wishlist')
    );
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;

    // Check if product exists
    const product = await supabaseService.getProductById(product_id);
    
    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    // Check if already in wishlist
    const existingWishlistItems = await supabaseService.getWishlistItems(req.user.id);
    const alreadyInWishlist = existingWishlistItems.some(item => item.product_id === product_id);

    if (alreadyInWishlist) {
      return res.status(400).json(
        createResponse(false, null, 'Product already in wishlist')
      );
    }

    const wishlistItem = await supabaseService.supabase
      .from('wishlist_items')
      .insert({
        user_id: req.user.id,
        product_id
      })
      .select(`
        *,
        product:products(*, images:product_images(*))
      `)
      .single();

    if (wishlistItem.error) {
      throw wishlistItem.error;
    }

    logger.info(`Item added to wishlist: ${product.name} (User: ${req.user.id})`);

    res.status(201).json(
      createResponse(true, wishlistItem.data, 'Item added to wishlist')
    );

  } catch (error) {
    logger.error('Add to wishlist error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to add item to wishlist')
    );
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const { error } = await supabaseService.supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    logger.info(`Item removed from wishlist: ${productId} (User: ${req.user.id})`);

    res.json(
      createResponse(true, null, 'Item removed from wishlist')
    );

  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to remove item from wishlist')
    );
  }
};

const getAddresses = async (req, res) => {
  try {
    const { data: addresses, error } = await supabaseService.supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(
      createResponse(true, addresses)
    );

  } catch (error) {
    logger.error('Get addresses error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch addresses')
    );
  }
};

const addAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      user_id: req.user.id
    };

    // If this is set as default, unset other default addresses
    if (addressData.is_default) {
      await supabaseService.supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data: address, error } = await supabaseService.supabase
      .from('addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Address added for user: ${req.user.id}`);

    res.status(201).json(
      createResponse(true, address, 'Address added successfully')
    );

  } catch (error) {
    logger.error('Add address error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to add address')
    );
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;

    // If this is set as default, unset other default addresses
    if (updates.is_default) {
      await supabaseService.supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data: address, error } = await supabaseService.supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!address) {
      return res.status(404).json(
        createResponse(false, null, 'Address not found')
      );
    }

    res.json(
      createResponse(true, address, 'Address updated successfully')
    );

  } catch (error) {
    logger.error('Update address error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to update address')
    );
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const { error } = await supabaseService.supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json(
      createResponse(true, null, 'Address deleted successfully')
    );

  } catch (error) {
    logger.error('Delete address error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to delete address')
    );
  }
};

const createReview = async (req, res) => {
  try {
    const { product_id, rating, title, comment } = req.body;

    // Check if product exists
    const product = await supabaseService.getProductById(product_id);
    
    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabaseService.supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .single();

    if (existingReview) {
      return res.status(400).json(
        createResponse(false, null, 'You have already reviewed this product')
      );
    }

    const { data: review, error } = await supabaseService.supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        product_id,
        rating,
        title,
        comment
      })
      .select(`
        *,
        profiles(full_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Review created for product: ${product_id} (User: ${req.user.id})`);

    res.status(201).json(
      createResponse(true, review, 'Review created successfully')
    );

  } catch (error) {
    logger.error('Create review error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to create review')
    );
  }
};

const getUserStats = async (req, res) => {
  try {
    // Get user orders
    const orders = await supabaseService.getUserOrders(req.user.id);
    
    // Get wishlist count
    const wishlistItems = await supabaseService.getWishlistItems(req.user.id);
    
    // Get reviews count
    const { data: reviews, error: reviewsError } = await supabaseService.supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id);

    if (reviewsError) {
      throw reviewsError;
    }

    const stats = {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
      wishlist_items: wishlistItems.length,
      reviews_written: reviews.length,
      orders_by_status: {},
      recent_activity: {
        last_order: orders[0] || null,
        last_review: reviews[0] || null
      }
    };

    // Count orders by status
    orders.forEach(order => {
      stats.orders_by_status[order.status] = (stats.orders_by_status[order.status] || 0) + 1;
    });

    stats.total_spent = Math.round(stats.total_spent * 100) / 100;

    res.json(
      createResponse(true, stats)
    );

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch user statistics')
    );
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  createReview,
  getUserStats
};