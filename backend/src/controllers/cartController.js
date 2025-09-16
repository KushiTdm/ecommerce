const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse } = require('../utils/helpers');

const getCart = async (req, res) => {
  try {
    const cartItems = await supabaseService.getCartItems(req.user.id);

    // Calculate cart totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartData = {
      items: cartItems,
      summary: {
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: subtotal > 100 ? 0 : 10,
        tax: Math.round(subtotal * 0.08 * 100) / 100,
        total: Math.round((subtotal + (subtotal > 100 ? 0 : 10) + (subtotal * 0.08)) * 100) / 100
      }
    };

    res.json(
      createResponse(true, cartData)
    );

  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch cart')
    );
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, variant_id, quantity } = req.body;

    // Check if product exists and is in stock
    const product = await supabaseService.getProductById(product_id);
    
    if (!product) {
      return res.status(404).json(
        createResponse(false, null, 'Product not found')
      );
    }

    if (!product.in_stock) {
      return res.status(400).json(
        createResponse(false, null, 'Product is out of stock')
      );
    }

    // Check stock availability
    const hasStock = await supabaseService.checkProductStock(product_id, variant_id, quantity);
    
    if (!hasStock) {
      return res.status(400).json(
        createResponse(false, null, 'Insufficient stock available')
      );
    }

    const cartItem = await supabaseService.addToCart(req.user.id, product_id, variant_id, quantity);

    logger.info(`Item added to cart: ${product.name} (User: ${req.user.id})`);

    res.status(201).json(
      createResponse(true, cartItem, 'Item added to cart')
    );

  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to add item to cart')
    );
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json(
        createResponse(false, null, 'Quantity cannot be negative')
      );
    }

    // Get cart item to verify ownership
    const cartItems = await supabaseService.getCartItems(req.user.id);
    const cartItem = cartItems.find(item => item.id === itemId);

    if (!cartItem) {
      return res.status(404).json(
        createResponse(false, null, 'Cart item not found')
      );
    }

    if (quantity === 0) {
      await supabaseService.removeCartItem(itemId);
      return res.json(
        createResponse(true, null, 'Item removed from cart')
      );
    }

    // Check stock availability for the new quantity
    const hasStock = await supabaseService.checkProductStock(
      cartItem.product_id, 
      cartItem.variant_id, 
      quantity
    );
    
    if (!hasStock) {
      return res.status(400).json(
        createResponse(false, null, 'Insufficient stock available')
      );
    }

    const updatedItem = await supabaseService.updateCartItem(itemId, quantity);

    res.json(
      createResponse(true, updatedItem, 'Cart item updated')
    );

  } catch (error) {
    logger.error('Update cart item error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to update cart item')
    );
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify cart item belongs to user
    const cartItems = await supabaseService.getCartItems(req.user.id);
    const cartItem = cartItems.find(item => item.id === itemId);

    if (!cartItem) {
      return res.status(404).json(
        createResponse(false, null, 'Cart item not found')
      );
    }

    await supabaseService.removeCartItem(itemId);

    res.json(
      createResponse(true, null, 'Item removed from cart')
    );

  } catch (error) {
    logger.error('Remove cart item error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to remove cart item')
    );
  }
};

const clearCart = async (req, res) => {
  try {
    await supabaseService.clearCart(req.user.id);

    logger.info(`Cart cleared for user: ${req.user.id}`);

    res.json(
      createResponse(true, null, 'Cart cleared')
    );

  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to clear cart')
    );
  }
};

const getCartItemCount = async (req, res) => {
  try {
    const cartItems = await supabaseService.getCartItems(req.user.id);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json(
      createResponse(true, { itemCount })
    );

  } catch (error) {
    logger.error('Get cart item count error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to get cart item count')
    );
  }
};

const validateCart = async (req, res) => {
  try {
    const cartItems = await supabaseService.getCartItems(req.user.id);
    const validationResults = [];

    for (const item of cartItems) {
      const product = await supabaseService.getProductById(item.product_id);
      const hasStock = await supabaseService.checkProductStock(
        item.product_id, 
        item.variant_id, 
        item.quantity
      );

      validationResults.push({
        item_id: item.id,
        product_id: item.product_id,
        product_name: product?.name,
        requested_quantity: item.quantity,
        available: product?.in_stock && hasStock,
        issues: [
          ...(!product ? ['Product not found'] : []),
          ...(!product?.in_stock ? ['Product out of stock'] : []),
          ...(!hasStock ? ['Insufficient stock'] : [])
        ]
      });
    }

    const hasIssues = validationResults.some(result => result.issues.length > 0);

    res.json(
      createResponse(true, {
        valid: !hasIssues,
        items: validationResults,
        summary: {
          total_items: validationResults.length,
          valid_items: validationResults.filter(r => r.issues.length === 0).length,
          invalid_items: validationResults.filter(r => r.issues.length > 0).length
        }
      })
    );

  } catch (error) {
    logger.error('Validate cart error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to validate cart')
    );
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartItemCount,
  validateCart
};