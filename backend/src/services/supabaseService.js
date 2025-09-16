// backend/src/services/supabaseService.js
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  // Products
  async getProducts(filters = {}) {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('in_stock', true);

      // Apply filters
      if (filters.category) {
        query = query.eq('category.slug', filters.category);
      }
      
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      // Sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { data, count };
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          reviews:reviews(*, profiles(full_name))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching product:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Cart operations
  async getCartItems(userId) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async addToCart(userId, productId, variantId, quantity) {
    try {
      // Check if item already exists
      const { data: existingItem } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await this.supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new item
        const { data, error } = await this.supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            variant_id: variantId,
            quantity
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeCartItem(itemId);
      }

      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeCartItem(itemId) {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error removing cart item:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Order operations
  async createOrder(orderData) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async createOrderItems(orderItems) {
    try {
      const { data, error } = await this.supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating order items:', error);
      throw error;
    }
  }

  async getUserOrders(userId, filters = {}) {
    try {
      let query = this.supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*, product:products(*))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*, product:products(*))
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  // User operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Stock management
  async checkProductStock(productId, variantId, quantity) {
    try {
      if (variantId) {
        const { data, error } = await this.supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (error) throw error;
        return data.stock_quantity >= quantity;
      } else {
        const { data, error } = await this.supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single();

        if (error) throw error;
        return data.stock_quantity >= quantity;
      }
    } catch (error) {
      logger.error('Error checking stock:', error);
      throw error;
    }
  }

  async updateProductStock(productId, variantId, quantity) {
    try {
      if (variantId) {
        const { error } = await this.supabase
          .from('product_variants')
          .update({ stock_quantity: this.supabase.raw(`stock_quantity - ${quantity}`) })
          .eq('id', variantId);

        if (error) throw error;
      } else {
        const { error } = await this.supabase
          .from('products')
          .update({ stock_quantity: this.supabase.raw(`stock_quantity - ${quantity}`) })
          .eq('id', productId);

        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      logger.error('Error updating stock:', error);
      throw error;
    }
  }
}

module.exports = new SupabaseService();