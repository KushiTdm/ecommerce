import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Header: React.FC = () => {
  const { 
    cart, 
    wishlist, 
    user, 
    isCartOpen, 
    setCartOpen, 
    isMobileMenuOpen, 
    setMobileMenuOpen 
  } = useStore();
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Announcement Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Free shipping on orders over $100 • Easy returns within 30 days
      </div>
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-black">
            Minimal Store
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              All Products
            </Link>
            <Link 
              to="/category/clothing" 
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              Clothing
            </Link>
            <Link 
              to="/category/accessories" 
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              Accessories
            </Link>
            <Link 
              to="/sale" 
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              Sale
            </Link>
          </nav>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <Search size={20} />
            </button>
            
            {/* User */}
            <Link 
              to={user ? "/account" : "/login"} 
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <User size={20} />
            </Link>
            
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                to="/products" 
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              <Link 
                to="/category/clothing" 
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clothing
              </Link>
              <Link 
                to="/category/accessories" 
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link 
                to="/sale" 
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sale
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};