// src/components/Products/ProductGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '../../store/useStore';

interface ProductGridProps {
  products: Product[];
  title?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title,
  className = '' 
}) => {
  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-black mb-8 text-center"
        >
          {title}
        </motion.h2>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </section>
  );
};