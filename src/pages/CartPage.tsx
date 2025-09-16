import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEO/SEOHead';
import { useStore } from '../store/useStore';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    user 
  } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <SEOHead
          title="Shopping Cart - Minimal Store"
          description="Review your selected items and proceed to checkout"
          canonical="https://minimal-store.com/cart"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Shopping Cart - Minimal Store"
        description="Review your selected items and proceed to checkout"
        canonical="https://minimal-store.com/cart"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="text-lg font-medium text-black hover:text-gray-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">{item.product.category}</p>
                    {item.variant && (
                      <p className="text-gray-500 text-sm">{item.variant.name}: {item.variant.value}</p>
                    )}
                    <p className="text-lg font-semibold text-black mt-2">${item.product.price}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 mt-4">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1"
                      >
                        <X size={16} />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-black">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Clear Cart */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 transition-colors text-sm"
              >
                Clear Cart
              </button>
              <Link
                to="/products"
                className="text-black hover:text-gray-600 transition-colors text-sm flex items-center space-x-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm sticky top-8"
            >
              <h2 className="text-xl font-semibold text-black mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {subtotal < 100 && (
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <p className="text-sm text-gray-600">
                    Add <span className="font-semibold">${(100 - subtotal).toFixed(2)}</span> more for free shipping!
                  </p>
                </div>
              )}
              
              <Link
                to={user ? "/checkout" : "/login?redirect=checkout"}
                className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by industry-standard encryption
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};