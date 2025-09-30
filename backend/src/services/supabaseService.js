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

  async getProducts(filters = {}) {
    try {
      console.log('🔍 SupabaseService: getProducts called with filters:', filters);
      
      // Base query avec les bonnes jointures
      let query = this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          featured,
          in_stock,
          stock_quantity,
          sku,
          weight,
          dimensions,
          tags,
          created_at,
          updated_at,
          category:categories!products_category_id_fkey(
            id,
            name,
            slug,
            description,
            image_url
          ),
          images:product_images(
            id,
            url,
            alt_text,
            position
          ),
          variants:product_variants(
            id,
            name,
            value,
            price_adjustment,
            stock_quantity,
            sku
          )
        `)
        .eq('in_stock', true);

      // CORRECTION: Filtre par catégorie amélioré
      if (filters.category && filters.category !== 'all') {
        console.log('🎯 Applying category filter:', filters.category);
        
        // Normaliser le terme de recherche
        const searchTerm = filters.category.toLowerCase().trim();
        
        try {
          // Essayer de trouver la catégorie par slug ou nom (case insensitive)
          const { data: categoryData, error: categoryError } = await this.supabase
            .from('categories')
            .select('id, name, slug')
            .or(`slug.ilike.${searchTerm},name.ilike.%${searchTerm}%`)
            .limit(1)
            .maybeSingle(); // Utilise maybeSingle pour éviter les erreurs si pas trouvé

          if (categoryError) {
            console.error('❌ Error searching category:', categoryError);
            // Continue sans filtrage plutôt que de planter
          } else if (categoryData) {
            console.log('✅ Found category:', categoryData);
            query = query.eq('category_id', categoryData.id);
          } else {
            console.log('⚠️ No category found for:', filters.category);
            // Si aucune catégorie trouvée, retourner un tableau vide plutôt que tous les produits
            return { data: [], count: 0 };
          }
        } catch (categorySearchError) {
          console.error('💥 Category search failed:', categorySearchError);
          // En cas d'erreur, continuer sans filtrage
        }
      }
      
      // Filtre featured
      if (filters.featured !== undefined) {
        console.log('⭐ Applying featured filter:', filters.featured);
        query = query.eq('featured', filters.featured);
      }
      
      // Recherche textuelle
      if (filters.search) {
        console.log('🔍 Applying search filter:', filters.search);
        const searchTerm = `%${filters.search}%`;
        query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},short_description.ilike.${searchTerm}`);
      }
      
      // Filtres de prix
      if (filters.minPrice !== undefined) {
        console.log('💰 Applying minPrice filter:', filters.minPrice);
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        console.log('💰 Applying maxPrice filter:', filters.maxPrice);
        query = query.lte('price', filters.maxPrice);
      }

      // Tri
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      console.log('📊 Applying sort:', { sortBy, sortOrder });
      
      // Gérer les différents types de tri
      if (sortBy === 'name') {
        query = query.order('name', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'price') {
        query = query.order('price', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      }

      // Pagination
      if (filters.limit) {
        console.log('📄 Applying limit:', filters.limit);
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        console.log('📄 Applying offset:', filters.offset);
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      console.log('🚀 Executing Supabase query...');
      const { data, error, count } = await query;
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }
      
      // Transformer les données pour s'assurer que les images sont triées par position
      const transformedData = data?.map(product => ({
        ...product,
        images: product.images?.sort((a, b) => a.position - b.position) || [],
        variants: product.variants || []
      })) || [];
      
      console.log('✅ Supabase query success:', {
        dataCount: transformedData.length,
        count,
        firstProduct: transformedData[0]?.name || 'None',
        sampleCategories: transformedData.slice(0, 3).map(p => ({
          productName: p.name,
          categoryName: p.category?.name || 'No category',
          categoryId: p.category?.id || 'No ID'
        }))
      });
      
      return { data: transformedData, count: count || transformedData.length };
      
    } catch (error) {
      console.error('💥 Error in getProducts:', error);
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      console.log('🔍 SupabaseService: getProductById called with id:', id);
      
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          featured,
          in_stock,
          stock_quantity,
          sku,
          weight,
          dimensions,
          tags,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories!products_category_id_fkey(
            id,
            name,
            slug,
            description,
            image_url
          ),
          images:product_images(
            id,
            url,
            alt_text,
            position
          ),
          variants:product_variants(
            id,
            name,
            value,
            price_adjustment,
            stock_quantity,
            sku
          ),
          reviews:reviews(
            id,
            rating,
            title,
            comment,
            verified_purchase,
            helpful_count,
            created_at,
            user:profiles(full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching product by ID:', error);
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        throw error;
      }

      // Transformer les données
      const transformedData = {
        ...data,
        images: data.images?.sort((a, b) => a.position - b.position) || [],
        variants: data.variants || [],
        reviews: data.reviews?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []
      };
      
      console.log('✅ Product fetched successfully:', transformedData.name);
      return transformedData;
      
    } catch (error) {
      console.error('💥 Error in getProductById:', error);
      logger.error('Error fetching product:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log('🔍 SupabaseService: getCategories called');
      
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name, slug, description, image_url, created_at')
        .order('name');

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }
      
      console.log('✅ Categories fetched:', {
        count: data?.length || 0,
        categories: data?.map(cat => ({ name: cat.name, slug: cat.slug })) || []
      });
      
      return data || [];
      
    } catch (error) {
      console.error('💥 Error in getCategories:', error);
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getProductsByCategory(categorySlug) {
    try {
      console.log('🔍 SupabaseService: getProductsByCategory called with:', categorySlug);
      
      return await this.getProducts({ category: categorySlug });
      
    } catch (error) {
      console.error('💥 Error in getProductsByCategory:', error);
      logger.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Méthodes pour le panier
  async getCartItems(userId) {
    try {
      console.log('🛒 SupabaseService: getCartItems called for user:', userId);
      
      const { data, error } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            price,
            images:product_images(
              id,
              url,
              alt_text,
              position
            )
          ),
          variant:product_variants(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching cart items:', error);
        throw error;
      }
      
      // Transformer pour trier les images
      const transformedData = data?.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: item.product.images?.sort((a, b) => a.position - b.position) || []
        } : null
      })) || [];
      
      console.log('✅ Cart items fetched:', transformedData.length);
      return transformedData;
      
    } catch (error) {
      logger.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async addToCart(userId, productId, variantId, quantity) {
    try {
      console.log('🛒 Adding to cart:', { userId, productId, variantId, quantity });
      
      const { data: existingItem } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .single();

      if (existingItem) {
        const { data, error } = await this.supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Cart item updated');
        return data;
      } else {
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
        console.log('✅ New cart item added');
        return data;
      }
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      console.log('🛒 Updating cart item:', { itemId, quantity });
      
      if (quantity <= 0) {
        return this.removeCartItem(itemId);
      }

      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Cart item updated');
      return data;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeCartItem(itemId) {
    try {
      console.log('🛒 Removing cart item:', itemId);
      
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      console.log('✅ Cart item removed');
      return true;
    } catch (error) {
      logger.error('Error removing cart item:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      console.log('🛒 Clearing cart for user:', userId);
      
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      console.log('✅ Cart cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }
}

module.exports = new SupabaseService();