const supabaseService = require('./supabaseService');
const stripeService = require('./stripeService');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const { generateOrderNumber, calculateOrderTotals } = require('../utils/helpers');

class OrderService {
  async createOrder(userId, orderData) {
    try {
      // Get user's cart items
      const cartItems = await supabaseService.getCartItems(userId);
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate stock availability
      for (const item of cartItems) {
        const hasStock = await supabaseService.checkProductStock(
          item.product_id,
          item.variant_id,
          item.quantity
        );
        
        if (!hasStock) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }
      }

      // Calculate order totals
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        product_snapshot: {
          name: item.product.name,
          description: item.product.description,
          image: item.product.images?.[0]?.url,
          category: item.product.category?.name
        }
      }));

      const totals = calculateOrderTotals(orderItems, orderData.shippingAmount || 10);

      // Create order
      const order = await supabaseService.createOrder({
        user_id: userId,
        order_number: generateOrderNumber(),
        status: 'pending',
        subtotal: totals.subtotal,
        tax_amount: totals.tax,
        shipping_amount: totals.shipping,
        total_amount: totals.total,
        currency: 'USD',
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        payment_status: 'pending',
        payment_method: orderData.paymentMethod || 'card',
        notes: orderData.notes || ''
      });

      // Create order items
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }));

      await supabaseService.createOrderItems(orderItemsWithOrderId);

      // Update stock quantities
      for (const item of cartItems) {
        await supabaseService.updateProductStock(
          item.product_id,
          item.variant_id,
          item.quantity
        );
      }

      // Clear user's cart
      await supabaseService.clearCart(userId);

      // Get complete order with items
      const completeOrder = await supabaseService.getOrderById(order.id, userId);

      // Send order confirmation email
      const user = await supabaseService.getUserProfile(userId);
      await emailService.sendOrderConfirmation(completeOrder, user);

      logger.info(`Order created successfully: ${order.order_number}`);
      return completeOrder;

    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async processPayment(orderId, userId, paymentData) {
    try {
      const order = await supabaseService.getOrderById(orderId, userId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.payment_status === 'paid') {
        throw new Error('Order already paid');
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripeService.createPaymentIntent(
        order.total_amount,
        'usd',
        {
          order_id: order.id,
          order_number: order.order_number,
          user_id: userId
        }
      );

      // Update order with payment intent ID
      await supabaseService.updateOrderStatus(orderId, 'confirmed');

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      };

    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId, userId) {
    try {
      const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      const orderId = paymentIntent.metadata.order_id;
      const order = await supabaseService.getOrderById(orderId, userId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Update order payment status
      await supabaseService.updateOrderStatus(orderId, 'processing');

      // Send payment confirmation email
      const user = await supabaseService.getUserProfile(userId);
      await emailService.sendPaymentConfirmation(order, user, paymentIntent);

      logger.info(`Payment confirmed for order: ${order.order_number}`);
      return order;

    } catch (error) {
      logger.error('Error confirming payment:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, newStatus, userId = null) {
    try {
      const order = await supabaseService.updateOrderStatus(orderId, newStatus);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Send status update email
      const user = await supabaseService.getUserProfile(order.user_id);
      await emailService.sendOrderStatusUpdate(order, user, newStatus);

      logger.info(`Order status updated: ${order.order_number} -> ${newStatus}`);
      return order;

    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, userId, reason = 'Customer request') {
    try {
      const order = await supabaseService.getOrderById(orderId, userId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (['shipped', 'delivered'].includes(order.status)) {
        throw new Error('Cannot cancel shipped or delivered orders');
      }

      // Restore stock quantities
      for (const item of order.order_items) {
        // Add stock back (negative quantity to add)
        await supabaseService.updateProductStock(
          item.product_id,
          item.variant_id,
          -item.quantity
        );
      }

      // Update order status
      await supabaseService.updateOrderStatus(orderId, 'cancelled');

      // If payment was made, create refund
      if (order.payment_status === 'paid') {
        // Implementation depends on payment method
        // For Stripe, create refund
        logger.info(`Refund needed for cancelled order: ${order.order_number}`);
      }

      logger.info(`Order cancelled: ${order.order_number} - ${reason}`);
      return order;

    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  async getOrderAnalytics(userId = null, dateRange = {}) {
    try {
      // This would be implemented based on specific analytics needs
      // For now, return basic order statistics
      
      const analytics = {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        topProducts: []
      };

      return analytics;

    } catch (error) {
      logger.error('Error getting order analytics:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();