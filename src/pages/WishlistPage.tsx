import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { SEOHead } from '../components/SEO/SEOHead';
import { ProductGrid } from '../components/Products/ProductGrid';
import { useStore } from '../store/useStore';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen">
        <SEOHead
          title="Wishlist - Minimal Store"
          description="Your saved items and favorites"
          canonical="https://minimal-store.com/wishlist"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8">
              Save items you love to your wishlist and shop them later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              <span>Start Shopping</span>
              <ShoppingBag size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Wishlist - Minimal Store"
        description="Your saved items and favorites"
        canonical="https://minimal-store.com/wishlist"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-black mb-4"
          >
            Your Wishlist
          </motion.h1>
          <p className="text-gray-600">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        <ProductGrid products={wishlist} />
      </div>
    </div>
  );
};