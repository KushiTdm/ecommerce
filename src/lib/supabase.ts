// src/lib/supabase.ts (Version avec logs détaillés et corrections)
import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite (frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL environment variable is missing');
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY environment variable is missing');
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

console.log('✅ Supabase configuration loaded:');
console.log('📍 URL:', supabaseUrl.substring(0, 30) + '...');
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  }
});

// Test connection immediately
console.log('🧪 Testing Supabase connection...');
supabase.from('products').select('id').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connected successfully. Found products:', data?.length || 0);
    }
  })
  .catch(err => {
    console.error('💥 Supabase connection test error:', err);
  });

// Updated Types to match your schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  category_id: string;
  featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
  sku: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  position: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

// Auth functions
export const signUp = async (email: string, password: string) => {
  console.log('🔐 Attempting signup for:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ Signup error:', error);
  } else {
    console.log('✅ Signup successful');
  }
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log('🔐 Attempting signin for:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ Signin error:', error);
  } else {
    console.log('✅ Signin successful');
  }
  
  return { data, error };
};

export const signOut = async () => {
  console.log('🔐 Attempting signout');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('❌ Signout error:', error);
  } else {
    console.log('✅ Signout successful');
  }
  
  return { error };
};

// FIXED Product functions with comprehensive logging
export const getProducts = async (categorySlug?: string, featured?: boolean) => {
  console.log('🚀 =====  getProducts START =====');
  console.log('📥 Input parameters:', { categorySlug, featured });
  
  try {
    console.log('🔍 Step 1: Testing basic connection...');
    
    // Test 1: Simple count query to verify connection
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total products in DB:', totalCount);
    if (countError) {
      console.error('❌ Count query failed:', countError);
      return { data: null, error: countError };
    }

    console.log('🔍 Step 2: Fetching all products (basic)...');
    
    // Test 2: Simple products query without filters
    const { data: basicProducts, error: basicError } = await supabase
      .from('products')
      .select('*');
    
    console.log('📦 Basic products query result:');
    console.log('   - Count:', basicProducts?.length || 0);
    console.log('   - Error:', basicError?.message || 'None');
    console.log('   - First product sample:', basicProducts?.[0] ? {
      id: basicProducts[0].id,
      name: basicProducts[0].name,
      price: basicProducts[0].price,
      in_stock: basicProducts[0].in_stock,
      category_id: basicProducts[0].category_id
    } : 'None');

    if (basicError) {
      console.error('❌ Basic products query failed:', basicError);
      return { data: null, error: basicError };
    }

    if (!basicProducts || basicProducts.length === 0) {
      console.warn('⚠️ No products found in database');
      return { data: [], error: null };
    }

    console.log('🔍 Step 3: Applying filters...');
    
    let filteredProducts = [...basicProducts];
    
    // Apply in_stock filter
    console.log('🎯 Filtering for in_stock products only...');
    filteredProducts = filteredProducts.filter(product => product.in_stock === true);
    console.log('   - After in_stock filter:', filteredProducts.length, 'products');

    // Apply featured filter
    if (featured !== undefined) {
      console.log('🎯 Filtering by featured:', featured);
      const beforeCount = filteredProducts.length;
      filteredProducts = filteredProducts.filter(product => product.featured === featured);
      console.log('   - Before featured filter:', beforeCount);
      console.log('   - After featured filter:', filteredProducts.length);
    }

    // Apply category filter
    if (categorySlug) {
      console.log('🎯 Filtering by category slug:', categorySlug);
      
      // First, get the category ID
      console.log('🔍 Looking up category by slug...');
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();
      
      console.log('📂 Category lookup result:', {
        found: !!categoryData,
        error: categoryError?.message || 'None',
        category: categoryData || null
      });

      if (categoryError && categoryError.code !== 'PGRST116') {
        console.error('❌ Category lookup failed:', categoryError);
        return { data: null, error: categoryError };
      }

      if (categoryData) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => product.category_id === categoryData.id);
        console.log('   - Before category filter:', beforeCount);
        console.log('   - After category filter:', filteredProducts.length);
        console.log('   - Looking for category_id:', categoryData.id);
        console.log('   - Sample product categories:', filteredProducts.slice(0, 3).map(p => ({
          name: p.name,
          category_id: p.category_id
        })));
      } else {
        console.warn('⚠️ Category not found:', categorySlug);
        return { data: [], error: null };
      }
    }

    console.log('🔍 Step 4: Enriching products with relations...');
    
    // Enrich products with category and images data
    const enrichedProducts = await Promise.all(
      filteredProducts.map(async (product, index) => {
        console.log(`🔄 Enriching product ${index + 1}/${filteredProducts.length}: ${product.name}`);
        
        const enrichedProduct = { ...product };
        
        // Add category data
        if (product.category_id) {
          try {
            console.log(`   - Fetching category for product ${product.name}...`);
            const { data: categoryData, error: catError } = await supabase
              .from('categories')
              .select('id, name, slug')
              .eq('id', product.category_id)
              .single();
            
            if (catError) {
              console.warn(`   ⚠️ Failed to get category for ${product.name}:`, catError.message);
              enrichedProduct.categories = null;
            } else {
              console.log(`   ✅ Category found: ${categoryData.name}`);
              enrichedProduct.categories = categoryData;
            }
          } catch (err) {
            console.warn(`   ⚠️ Category fetch error for ${product.name}:`, err);
            enrichedProduct.categories = null;
          }
        }

        // Add images data
        try {
          console.log(`   - Fetching images for product ${product.name}...`);
          const { data: images, error: imgError } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', product.id)
            .order('position');
          
          if (imgError) {
            console.warn(`   ⚠️ Failed to get images for ${product.name}:`, imgError.message);
            enrichedProduct.product_images = [];
          } else {
            console.log(`   ✅ Images found: ${images?.length || 0}`);
            enrichedProduct.product_images = images || [];
          }
        } catch (err) {
          console.warn(`   ⚠️ Images fetch error for ${product.name}:`, err);
          enrichedProduct.product_images = [];
        }

        return enrichedProduct;
      })
    );

    console.log('✅ =====  getProducts SUCCESS =====');
    console.log('📊 Final results:');
    console.log('   - Input filters:', { categorySlug, featured });
    console.log('   - Products returned:', enrichedProducts.length);
    console.log('   - Sample products:', enrichedProducts.slice(0, 2).map(p => ({
      name: p.name,
      price: p.price,
      category: p.categories?.name || 'No category',
      images: p.product_images?.length || 0
    })));
    
    return { data: enrichedProducts, error: null };

  } catch (error) {
    console.error('💥 =====  getProducts FAILED =====');
    console.error('💥 Unexpected error:', error);
    console.error('💥 Stack:', error instanceof Error ? error.stack : 'No stack');
    return { data: null, error: error as Error };
  }
};

export const getProduct = async (id: string) => {
  console.log('🔍 Getting product by ID:', id);
  
  try {
    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ Get product error:', error);
    } else {
      console.log('✅ Product retrieved successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getProduct:', error);
    return { data: null, error: error as Error };
  }
};

export const getProductBySlug = async (slug: string) => {
  console.log('🔍 Getting product by slug:', slug);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*),
        reviews:reviews(*, profiles(full_name))
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('❌ Get product by slug error:', error);
    } else {
      console.log('✅ Product retrieved by slug successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getProductBySlug:', error);
    return { data: null, error: error as Error };
  }
};

export const searchProducts = async (query: string) => {
  console.log('🔍 Searching products:', query);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`)
      .eq('in_stock', true)
      .limit(20);

    if (error) {
      console.error('❌ Search products error:', error);
    } else {
      console.log(`✅ Found ${data?.length || 0} products matching search`);
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in searchProducts:', error);
    return { data: null, error: error as Error };
  }
};

// Category functions
export const getCategories = async () => {
  console.log('🗂️ Getting categories');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Get categories error:', error);
    } else {
      console.log(`✅ Retrieved ${data?.length || 0} categories`);
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getCategories:', error);
    return { data: null, error: error as Error };
  }
};

// Cart functions
export const getCartItems = async (userId: string) => {
  console.log('🛒 Getting cart items for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Get cart items error:', error);
    } else {
      console.log(`✅ Retrieved ${data?.length || 0} cart items`);
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getCartItems:', error);
    return { data: null, error: error as Error };
  }
};

export const addToCart = async (userId: string, productId: string, variantId?: string, quantity: number = 1) => {
  console.log('🛒 Adding to cart:', { userId, productId, variantId, quantity });
  
  try {
    // Check if item already exists
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update cart item error:', error);
      } else {
        console.log('✅ Cart item quantity updated');
      }

      return { data, error };
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          variant_id: variantId,
          quantity
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add to cart error:', error);
      } else {
        console.log('✅ Item added to cart');
      }

      return { data, error };
    }
  } catch (error) {
    console.error('💥 Unexpected error in addToCart:', error);
    return { data: null, error: error as Error };
  }
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  console.log('🛒 Updating cart item:', { itemId, quantity });
  
  try {
    if (quantity <= 0) {
      return removeCartItem(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update cart item error:', error);
    } else {
      console.log('✅ Cart item updated');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in updateCartItem:', error);
    return { data: null, error: error as Error };
  }
};

export const removeCartItem = async (itemId: string) => {
  console.log('🛒 Removing cart item:', itemId);
  
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('❌ Remove cart item error:', error);
    } else {
      console.log('✅ Cart item removed');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in removeCartItem:', error);
    return { data: null, error: error as Error };
  }
};

export const clearCart = async (userId: string) => {
  console.log('🛒 Clearing cart for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Clear cart error:', error);
    } else {
      console.log('✅ Cart cleared');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in clearCart:', error);
    return { data: null, error: error as Error };
  }
};

// Wishlist functions
export const getWishlistItems = async (userId: string) => {
  console.log('❤️ Getting wishlist items for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*, images:product_images(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Get wishlist items error:', error);
    } else {
      console.log(`✅ Retrieved ${data?.length || 0} wishlist items`);
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getWishlistItems:', error);
    return { data: null, error: error as Error };
  }
};

export const addToWishlist = async (userId: string, productId: string) => {
  console.log('❤️ Adding to wishlist:', { userId, productId });
  
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Add to wishlist error:', error);
    } else {
      console.log('✅ Item added to wishlist');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in addToWishlist:', error);
    return { data: null, error: error as Error };
  }
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  console.log('❤️ Removing from wishlist:', { userId, productId });
  
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('❌ Remove from wishlist error:', error);
    } else {
      console.log('✅ Item removed from wishlist');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in removeFromWishlist:', error);
    return { data: null, error: error as Error };
  }
};

// Review functions
export const addReview = async (userId: string, productId: string, rating: number, title: string, comment: string) => {
  console.log('⭐ Adding review:', { userId, productId, rating });
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: productId,
        rating,
        title,
        comment
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Add review error:', error);
    } else {
      console.log('✅ Review added');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in addReview:', error);
    return { data: null, error: error as Error };
  }
};

// Profile functions
export const getProfile = async (userId: string) => {
  console.log('👤 Getting profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Get profile error:', error);
    } else {
      console.log('✅ Profile retrieved');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in getProfile:', error);
    return { data: null, error: error as Error };
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  console.log('👤 Updating profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update profile error:', error);
    } else {
      console.log('✅ Profile updated');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in updateProfile:', error);
    return { data: null, error: error as Error };
  }
};

export const createProfile = async (userId: string, email: string, fullName?: string) => {
  console.log('👤 Creating profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || ''
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Create profile error:', error);
    } else {
      console.log('✅ Profile created');
    }

    return { data, error };
  } catch (error) {
    console.error('💥 Unexpected error in createProfile:', error);
    return { data: null, error: error as Error };
  }
};