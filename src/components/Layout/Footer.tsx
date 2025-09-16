import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Minimal Store</h3>
            <p className="text-gray-300 text-sm">
              Curated minimal fashion for the modern lifestyle. Quality pieces that last.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-semibold">Shop</h4>
            <nav className="space-y-2 text-sm">
              <Link to="/products" className="block text-gray-300 hover:text-white transition-colors">
                All Products
              </Link>
              <Link to="/category/clothing" className="block text-gray-300 hover:text-white transition-colors">
                Clothing
              </Link>
              <Link to="/category/accessories" className="block text-gray-300 hover:text-white transition-colors">
                Accessories
              </Link>
              <Link to="/sale" className="block text-gray-300 hover:text-white transition-colors">
                Sale
              </Link>
            </nav>
          </div>
          
          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <nav className="space-y-2 text-sm">
              <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link to="/shipping" className="block text-gray-300 hover:text-white transition-colors">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-gray-300 hover:text-white transition-colors">
                Returns
              </Link>
              <Link to="/size-guide" className="block text-gray-300 hover:text-white transition-colors">
                Size Guide
              </Link>
            </nav>
          </div>
          
          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <nav className="space-y-2 text-sm">
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/careers" className="block text-gray-300 hover:text-white transition-colors">
                Careers
              </Link>
              <Link to="/privacy" className="block text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2025 Minimal Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};