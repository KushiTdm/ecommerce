// src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEO/SEOHead';
import { ProductGrid } from '../components/Products/ProductGrid';
import { useStore } from '../store/useStore';

export const HomePage: React.FC = () => {
  const { products, loading, fetchProducts } = useStore();

  useEffect(() => {
    fetchProducts(undefined, true); // Fetch featured products
  }, [fetchProducts]);
  

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Minimal Store",
    "description": "Curated minimal fashion for the modern lifestyle",
    "url": "https://minimal-store.com"
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Minimal Store - Curated Fashion for Modern Living"
        description="Discover our collection of minimal, high-quality fashion pieces. Sustainable clothing and accessories for the modern lifestyle."
        canonical="https://minimal-store.com"
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Minimal. Modern. Timeless.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 text-gray-200"
          >
            Discover our curated collection of sustainable fashion pieces designed for the modern lifestyle.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-white text-black px-8 py-3 font-medium hover:bg-gray-100 transition-colors group"
            >
              <span>Shop Collection</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
        <ProductGrid 
          products={featuredProducts} 
          title="Featured Products"
        />
        )}
        
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 border-2 border-black text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors group"
          >
            <span>View All Products</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We believe in creating products that last, with minimal impact on the environment and maximum impact on your style.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">♻</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
              <p className="text-gray-600">
                Made from organic and recycled materials with ethical production practices.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p className="text-gray-600">
                Premium materials and craftsmanship that stands the test of time.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">—</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Minimal</h3>
              <p className="text-gray-600">
                Clean, timeless designs that work effortlessly with your lifestyle.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};