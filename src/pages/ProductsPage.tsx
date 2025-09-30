// src/pages/ProductsPage.tsx - Fixed version
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { SEOHead } from '../components/SEO/SEOHead';
import { ProductGrid } from '../components/Products/ProductGrid';
import { useStore } from '../store/useStore';

export const ProductsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { products, loading, error, fetchProducts } = useStore();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const categories = ['all', 'clothing', 'accessories', 'shoes', 'bags'];

  // Debug: Log initial render
  console.log('📄 ===== ProductsPage RENDER START =====');
  console.log('📄 URL category param:', category);
  console.log('📄 Store state:', {
    productsCount: products.length,
    loading,
    error,
    selectedCategory,
    filteredCount: filteredProducts.length,
    hasInitialLoad
  });

  // FIXED: Initial load effect - runs once on mount to fetch initial data
  useEffect(() => {
    console.log('🔄 ===== ProductsPage: Initial Load Effect =====');
    
    if (!hasInitialLoad) {
      console.log('🚀 Performing initial load...');
      setHasInitialLoad(true);
      
      if (category && category !== 'all') {
        console.log('📞 Initial fetch with category:', category);
        setSelectedCategory(category);
        fetchProducts(category);
      } else {
        console.log('📞 Initial fetch all products');
        setSelectedCategory('all');
        fetchProducts(); // Fetch all products
      }
    }
  }, []); // Empty dependency array - runs only once on mount

  // Category change effect - handles URL changes
  useEffect(() => {
    console.log('🔄 ===== ProductsPage: Category URL Effect =====');
    console.log('🔄 Category param changed to:', category);
    console.log('🔄 Current selectedCategory:', selectedCategory);
    console.log('🔄 Has initial load:', hasInitialLoad);
    
    // Only handle URL changes after initial load
    if (hasInitialLoad) {
      const newCategory = category || 'all';
      
      if (newCategory !== selectedCategory) {
        console.log('🎯 URL category changed, updating to:', newCategory);
        setSelectedCategory(newCategory);
        
        if (newCategory === 'all') {
          console.log('📞 Fetching all products due to URL change');
          fetchProducts();
        } else {
          console.log('📞 Fetching products for category due to URL change:', newCategory);
          fetchProducts(newCategory);
        }
      }
    }
  }, [category, hasInitialLoad, selectedCategory, fetchProducts]);

  useEffect(() => {
    console.log('🔄 ===== ProductsPage: Products Filter Effect =====');
    console.log('🔄 Products changed. Count:', products.length);
    console.log('🔄 Current selectedCategory:', selectedCategory);
    console.log('🔄 Current sortBy:', sortBy);
    
    if (products.length === 0) {
      console.log('📭 No products to filter');
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...products];
    console.log('🔍 Starting with', filtered.length, 'products');
    
    // Filter by category - Only apply client-side filtering if we have "all" products
    // If we fetched by category, the server already filtered them
    if (selectedCategory !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(product => {
        // Vérifie que la catégorie existe et n'est pas null/undefined
        let productCategory: string | undefined;
        
        if (typeof product.category === 'string') {
          productCategory = product.category.toLowerCase();
        } else if (product.category && typeof product.category === 'object') {
          productCategory = (product.category as any).name?.toLowerCase() || (product.category as any).slug?.toLowerCase();
        }
        
        if (!productCategory) {
          console.log('⚠️ Product without category:', product.name);
          return false;
        }
        
        const matches = productCategory.includes(selectedCategory.toLowerCase()) || 
                       productCategory === selectedCategory.toLowerCase();
        
        if (!matches) {
          console.log(`🚫 Product "${product.name}" (category: "${productCategory}") doesn't match "${selectedCategory}"`);
        }
        
        return matches;
      });
      console.log(`🎯 Category filter "${selectedCategory}": ${beforeFilter} → ${filtered.length} products`);
    }
    
    // Sort products
    console.log('📊 Sorting by:', sortBy);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    console.log('✅ Final filtered products:', {
      count: filtered.length,
      sample: filtered.slice(0, 3).map(p => ({
        name: p.name,
        category: p.category?.name || (typeof p.category === 'string' ? p.category : 'Unknown'),
        price: p.price
      }))
    });
    
    setFilteredProducts(filtered);
    console.log('🔄 ===== Products Filter Effect END =====');
  }, [products, selectedCategory, sortBy]);

  const handleCategoryChange = (newCategory: string) => {
    console.log('🎯 ===== ProductsPage: Manual Category Change =====');
    console.log('🎯 Changing category from', selectedCategory, 'to', newCategory);
    
    setSelectedCategory(newCategory);
    
    if (newCategory === 'all') {
      console.log('📞 Fetching all products');
      fetchProducts(); // Charge tous les produits
    } else {
      console.log('📞 Fetching products for category:', newCategory);
      fetchProducts(newCategory);
    }
    
    console.log('🎯 ===== Manual Category Change END =====');
  };

  const handleSortChange = (newSort: string) => {
    console.log('📊 Sort changed to:', newSort);
    setSortBy(newSort);
  };

  // Debug: affiche l'état actuel avant le render
  console.log('📄 ===== ProductsPage RENDER STATE =====');
  console.log('📄 Render state:', {
    loading,
    error,
    productsCount: products.length,
    filteredCount: filteredProducts.length,
    selectedCategory,
    sortBy,
    categoryParam: category,
    hasInitialLoad,
    firstProduct: products[0]?.name || 'None',
    firstFiltered: filteredProducts[0]?.name || 'None'
  });
  console.log('📄 ===== ProductsPage RENDER END =====');

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'} - Minimal Store`}
        description={`Browse our ${category ? category : 'complete'} collection of minimal fashion pieces. High-quality clothing and accessories for the modern lifestyle.`}
        canonical={`https://minimal-store.com/${category ? `category/${category}` : 'products'}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-black mb-4"
          >
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </motion.h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our {category ? category : 'complete'} collection of carefully curated minimal fashion pieces.
          </p>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <button 
              onClick={() => fetchProducts(selectedCategory === 'all' ? undefined : selectedCategory)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter size={20} />
            <div className="flex flex-wrap gap-2">
              {categories.map(categoryName => (
                <button
                  key={categoryName}
                  onClick={() => handleCategoryChange(categoryName)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    selectedCategory === categoryName
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryName}
                </button>
              ))}
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
            <p className="text-xs text-gray-400 mt-2">
              Fetching {selectedCategory === 'all' ? 'all products' : `products in "${selectedCategory}"`}...
            </p>
          </div>
        ) : filteredProducts.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === 'all' 
                ? 'No products are available at the moment.' 
                : `No products found in the "${selectedCategory}" category.`}
            </p>
            {selectedCategory !== 'all' && (
              <button 
                onClick={() => handleCategoryChange('all')}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
            </div>
            <ProductGrid products={filteredProducts} />
          </>
        )}
      </div>
    </div>
  );
};