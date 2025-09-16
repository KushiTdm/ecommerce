// src/store/useStore.ts (Version corrigée avec logs détaillés)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getProducts,
  getCartItems,
  getWishlistItems,
  addToCart as addToCartDB,
  updateCartItem as updateCartItemDB,
  removeCartItem as removeCartItemDB,
  addToWishlist as addToWishlistDB,
  removeFromWishlist as removeFromWishlistDB,
  supabase
} from '../lib/supabase';

// Interface pour les données retournées par notre getProducts robuste
interface SupabaseProductEnriched {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  featured: boolean;
  in_stock: boolean;
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  product_images?: Array<{
    id: string;
    url: string;
    alt_text: string;
    position: number;
  }>;
}

// Transform Supabase product (enriched) to store product
const transformProduct = (product: SupabaseProductEnriched): Product => {
  console.log('🔄 Transforming product:', {
    id: product.id,
    name: product.name,
    price: product.price,
    priceType: typeof product.price,
    category: product.categories?.name || 'No category',
    imagesCount: product.product_images?.length || 0,
    firstImage: product.product_images?.[0]?.url || 'No image'
  });
  
  // Fallback image si aucune image n'est disponible
  const fallbackImage = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
  
  const transformed = {
    id: product.id,
    name: product.name,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    image: product.product_images?.[0]?.url || fallbackImage,
    description: product.description || product.short_description || '',
    category: product.categories?.name || 'Uncategorized',
    inStock: product.in_stock,
    featured: product.featured || false
  };
  
  console.log('✅ Product transformed:', {
    id: transformed.id,
    name: transformed.name,
    price: transformed.price,
    category: transformed.category,
    image: transformed.image.substring(0, 50) + '...'
  });
  
  return transformed;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: {
    id: string;
    name: string;
    value: string;
  };
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

interface Store {
  // Products
  products: Product[];
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  fetchProducts: (categorySlug?: string, featured?: boolean) => Promise<void>;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  
  // Wishlist
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
  
  // UI State
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Products
      products: [],
      loading: false,
      error: null,
      setProducts: (products) => {
        console.log('📦 Store: Setting products:', products.length);
        set({ products });
      },
      
      fetchProducts: async (categorySlug?: string, featured?: boolean) => {
        console.log('🏪 ===== STORE fetchProducts START =====');
        console.log('🔸 Parameters:', { categorySlug, featured });
        console.log('🔸 Current store state:', {
          productsCount: get().products.length,
          loading: get().loading,
          error: get().error
        });
        
        set({ loading: true, error: null });
        
        try {
          console.log('📞 Store: Calling getProducts from supabase...');
          const startTime = Date.now();
          
          const { data, error } = await getProducts(categorySlug, featured);
          
          const duration = Date.now() - startTime;
          console.log(`⏱️ Store: getProducts call completed in ${duration}ms`);
          
          console.log('📨 Store: getProducts response:', { 
            hasData: !!data,
            dataLength: data?.length || 0, 
            hasError: !!error,
            errorMessage: error?.message || 'None',
            firstProduct: data?.[0]?.name || 'None'
          });

          if (error) {
            console.error('❌ Store: Error from getProducts:', error);
            set({ error: error.message, loading: false });
            return;
          }
          
          if (!data || data.length === 0) {
            console.log('📭 Store: No data returned or empty array');
            set({ products: [], loading: false });
            return;
          }

          console.log('🔄 Store: Starting product transformation...');
          const transformStartTime = Date.now();
          
          const transformedProducts = data.map((product, index) => {
            try {
              console.log(`🔄 Store: Transforming product ${index + 1}/${data.length}`);
              return transformProduct(product);
            } catch (transformError) {
              console.warn(`⚠️ Store: Failed to transform product ${product.id}:`, transformError);
              // Return a basic product structure as fallback
              return {
                id: product.id,
                name: product.name || 'Unknown Product',
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price || 0,
                image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
                description: product.description || '',
                category: 'Uncategorized',
                inStock: product.in_stock ?? true,
                featured: product.featured ?? false
              };
            }
          });
          
          const transformDuration = Date.now() - transformStartTime;
          console.log(`⏱️ Store: Product transformation completed in ${transformDuration}ms`);
          
          console.log('✅ Store: fetchProducts SUCCESS');
          console.log('📊 Store: Final results:', {
            originalCount: data.length,
            transformedCount: transformedProducts.length,
            sampleProducts: transformedProducts.slice(0, 2).map(p => ({
              name: p.name,
              price: p.price,
              category: p.category
            }))
          });
          
          set({ products: transformedProducts, loading: false });
          
        } catch (error) {
          console.error('💥 Store: fetchProducts CATCH ERROR:', error);
          console.error('💥 Store: Error type:', typeof error);
          console.error('💥 Store: Error stack:', error instanceof Error ? error.stack : 'No stack');
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: errorMessage, loading: false });
        }
        
        console.log('🏪 ===== STORE fetchProducts END =====');
      },
      
      // Cart operations
      cart: [],
      addToCart: async (product, variantId, quantity = 1) => {
        console.log('🛒 Store: Adding to cart:', { productName: product.name, variantId, quantity });
        
        try {
          const { user } = get();
          
          if (!user) {
            console.log('🛒 Store: User not authenticated, using local cart');
            // Local cart management for non-authenticated users
            const existingItem = get().cart.find(item => 
              item.product.id === product.id && 
              item.variant?.id === variantId
            );
            
            if (existingItem) {
              console.log('🛒 Store: Item exists, updating quantity');
              set({
                cart: get().cart.map(item =>
                  item.id === existingItem.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                )
              });
            } else {
              console.log('🛒 Store: New item, adding to cart');
              const newItem: CartItem = {
                id: `temp-${Date.now()}`,
                product,
                variant: variantId ? { id: variantId, name: 'Size', value: 'M' } : undefined,
                quantity
              };
              set({ cart: [...get().cart, newItem] });
            }
          } else {
            console.log('🛒 Store: User authenticated, using database cart');
            // Database cart management for authenticated users
            const result = await addToCartDB(user.id, product.id, variantId, quantity);
            if (result.error) {
              console.error('❌ Store: Error adding to cart:', result.error);
              throw result.error;
            }
            await get().fetchCart();
          }
        } catch (error) {
          console.error('💥 Store: Error in addToCart:', error);
        }
      },

      removeFromCart: async (itemId) => {
        console.log('🛒 Store: Removing from cart:', itemId);
        
        try {
          const { user } = get();
          
          if (!user) {
            set({ cart: get().cart.filter(item => item.id !== itemId) });
          } else {
            const result = await removeCartItemDB(itemId);
            if (result.error) {
              console.error('❌ Store: Error removing from cart:', result.error);
              throw result.error;
            }
            await get().fetchCart();
          }
        } catch (error) {
          console.error('💥 Store: Error in removeFromCart:', error);
        }
      },

      updateQuantity: async (itemId, quantity) => {
        console.log('🛒 Store: Updating quantity:', { itemId, quantity });
        
        try {
          const { user } = get();
          
          if (!user) {
            if (quantity <= 0) {
              get().removeFromCart(itemId);
              return;
            }
            set({
              cart: get().cart.map(item =>
                item.id === itemId ? { ...item, quantity } : item
              )
            });
          } else {
            const result = await updateCartItemDB(itemId, quantity);
            if (result.error) {
              console.error('❌ Store: Error updating cart:', result.error);
              throw result.error;
            }
            await get().fetchCart();
          }
        } catch (error) {
          console.error('💥 Store: Error in updateQuantity:', error);
        }
      },

      clearCart: () => {
        console.log('🛒 Store: Clearing cart');
        set({ cart: [] });
      },

      fetchCart: async () => {
        console.log('🛒 Store: Fetching cart');
        
        try {
          const { user } = get();
          if (!user) {
            console.log('🛒 Store: No user, skipping cart fetch');
            return;
          }
          
          const { data, error } = await getCartItems(user.id);
          if (error) {
            console.error('❌ Store: Error fetching cart:', error);
            return;
          }
          
          // Transform cart items if needed
          const transformedCart = (data || []).map(item => ({
            id: item.id,
            product: transformProduct(item.product),
            variant: item.variant ? {
              id: item.variant.id,
              name: item.variant.name,
              value: item.variant.value
            } : undefined,
            quantity: item.quantity
          }));
          
          console.log('✅ Store: Cart fetched:', transformedCart.length, 'items');
          set({ cart: transformedCart });
        } catch (error) {
          console.error('💥 Store: Error in fetchCart:', error);
        }
      },
      
      // Wishlist operations
      wishlist: [],

      addToWishlist: async (product) => {
        console.log('❤️ Store: Adding to wishlist:', product.name);
        
        try {
          const { user } = get();
          
          if (!user) {
            // Check if product is already in wishlist
            const isAlreadyInWishlist = get().wishlist.some(item => item.id === product.id);
            if (!isAlreadyInWishlist) {
              set({ wishlist: [...get().wishlist, product] });
            }
          } else {
            const result = await addToWishlistDB(user.id, product.id);
            if (result.error) {
              console.error('❌ Store: Error adding to wishlist:', result.error);
              throw result.error;
            }
            await get().fetchWishlist();
          }
        } catch (error) {
          console.error('💥 Store: Error in addToWishlist:', error);
        }
      },

      removeFromWishlist: async (productId) => {
        console.log('❤️ Store: Removing from wishlist:', productId);
        
        try {
          const { user } = get();
          
          if (!user) {
            set({ wishlist: get().wishlist.filter(item => item.id !== productId) });
          } else {
            const result = await removeFromWishlistDB(user.id, productId);
            if (result.error) {
              console.error('❌ Store: Error removing from wishlist:', result.error);
              throw result.error;
            }
            await get().fetchWishlist();
          }
        } catch (error) {
          console.error('💥 Store: Error in removeFromWishlist:', error);
        }
      },

      fetchWishlist: async () => {
        console.log('❤️ Store: Fetching wishlist');
        
        try {
          const { user } = get();
          if (!user) {
            console.log('❤️ Store: No user, skipping wishlist fetch');
            return;
          }
          
          const { data, error } = await getWishlistItems(user.id);
          if (error) {
            console.error('❌ Store: Error fetching wishlist:', error);
            return;
          }
          
          // Transform wishlist items
          const transformedWishlist = (data || []).map(item => 
            transformProduct(item.product)
          );
          
          console.log('✅ Store: Wishlist fetched:', transformedWishlist.length, 'items');
          set({ wishlist: transformedWishlist });
        } catch (error) {
          console.error('💥 Store: Error in fetchWishlist:', error);
        }
      },
      
      // User management
      user: null,
      setUser: (user) => {
        console.log('👤 Store: Setting user:', user?.email || 'null');
        set({ user });
      },

      initializeAuth: async () => {
        console.log('🔐 Store: Initializing auth...');
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email || ''
            };
            
            console.log('✅ Store: User authenticated:', user.email);
            set({ user });
            
            // Fetch user data
            console.log('🔄 Store: Fetching user cart and wishlist...');
            await Promise.all([
              get().fetchCart(),
              get().fetchWishlist()
            ]);
            console.log('✅ Store: User data loaded');
          } else {
            console.log('ℹ️ Store: No active session found');
          }
        } catch (error) {
          console.error('💥 Store: Error initializing auth:', error);
        }
      },
      
      // UI State
      isCartOpen: false,
      setCartOpen: (open) => {
        console.log('🛒 Store: Setting cart open:', open);
        set({ isCartOpen: open });
      },
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => {
        console.log('📱 Store: Setting mobile menu open:', open);
        set({ isMobileMenuOpen: open });
      },
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
      }),
    }
  )
);

// Initialize auth on app start
if (typeof window !== 'undefined') {
  console.log('🚀 Store: Initializing auth on app start...');
  
  // Add a small delay to ensure the store is properly initialized
  setTimeout(async () => {
    try {
      console.log('⏰ Store: Auth initialization timeout triggered');
      await useStore.getState().initializeAuth();
      console.log('✅ Store: Auth initialization completed');
    } catch (error) {
      console.error('💥 Store: Failed to initialize auth:', error);
    }
  }, 100);
  
  // Listen for auth changes
  console.log('👂 Store: Setting up auth state listener...');
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Store: Auth state changed:', event);
    
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email || ''
        };
        
        console.log('✅ Store: User signed in:', user.email);
        useStore.getState().setUser(user);
        
        console.log('🔄 Store: Loading user data after sign in...');
        await Promise.all([
          useStore.getState().fetchCart(),
          useStore.getState().fetchWishlist()
        ]);
        console.log('✅ Store: User data loaded after sign in');
        
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Store: User signed out');
        useStore.getState().setUser(null);
        useStore.getState().clearCart();
        useStore.setState({ wishlist: [] });
      }
    } catch (error) {
      console.error('💥 Store: Error handling auth state change:', error);
    }
  });
}