import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useStore, Product } from '../../store/useStore';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, setCartOpen } = useStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showCartFeedback, setShowCartFeedback] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  
  if (isAddingToCart || !product.inStock) return;
  
  console.log('🛒 ProductCard: Adding to cart:', product.name);
  setIsAddingToCart(true);
  
  try {
    await addToCart(product, undefined, 1);
    
    // Show success feedback
    console.log('✅ ProductCard: Successfully added to cart');
    setShowCartFeedback(true);
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setShowCartFeedback(false);
    }, 2000);
    
  } catch (error) {
    console.error('❌ ProductCard: Error adding to cart:', error);
    alert('Failed to add item to cart. Please try again.');
  } finally {
    setIsAddingToCart(false);
  }
};

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white"
    >
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-105`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`bg-white text-black p-2 rounded-full transition-colors duration-200 ${
                  isAddingToCart 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-black hover:text-white'
                } ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Add to cart"
              >
                {isAddingToCart ? (
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <ShoppingBag size={16} />
                )}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isInWishlist 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          
          {/* Success feedback */}
          <AnimatePresence>
            {showCartFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center"
              >
                <div className="bg-white rounded-full p-4">
                  <Check size={32} className="text-green-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-xs font-medium">
              Featured
            </div>
          )}
          
          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
              <span className="text-gray-500 font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-1">
          <h3 className="text-black font-medium group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm">{product.category}</p>
          <p className="text-black font-semibold">${product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
};