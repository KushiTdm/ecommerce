const orderService = require('../services/orderService');
const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse, parsePagination, createPaginationMeta } = require('../utils/helpers');

const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id
    };

    const order = await orderService.createOrder(req.user.id, orderData);

    logger.info(`Order created: ${order.order_number} (User: ${req.user.id})`);

    res.status(201).json(
      createResponse(true, order, 'Order created successfully')
    );

  } catch (error) {
    logger.error('Create order error:', error);
    
    if (error.message.includes('Cart is empty')) {
      return res.status(400).json(
        createResponse(false, null, 'Cannot create order with empty cart')
      );
    }
    
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json(
        createResponse(false, null, error.message)
      );
    }

    res.status(500).json(
      createResponse(false, null, 'Failed to create order')
    );
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    
    const filters = {
      status: req.query.status,
      limit,
      offset
    };

    const orders = await supabaseService.getUserOrders(req.user.id, filters);

    // For pagination, we'd need to implement count in the service
    const meta = createPaginationMeta(page, limit, orders.length);

    res.json(
      createResponse(true, orders, null, meta)
    );

  } catch (error) {
    logger.error('Get user orders error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch orders')
    );
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await supabaseService.getOrderById(orderId, req.user.id);

    if (!order) {
      return res.status(404).json(
        createResponse(false, null, 'Order not found')
      );
    }

    res.json(
      createResponse(true, order)
    );

  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch order')
    );
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Only admins can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json(
        createResponse(false, null, 'Admin access required')
      );
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    logger.info(`Order status updated: ${order.order_number} -> ${status}`);

    res.json(
      createResponse(true, order, 'Order status updated')
    );

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to update order status')
    );
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(orderId, req.user.id, reason);

    logger.info(`Order cancelled: ${order.order_number} (User: ${req.user.id})`);

    res.json(
      createResponse(true, order, 'Order cancelled successfully')
    );

  } catch (error) {
    logger.error('Cancel order error:', error);
    
    if (error.message.includes('Cannot cancel')) {
      return res.status(400).json(
        createResponse(false, null, error.message)
      );
    }

    res.status(500).json(
      createResponse(false, null, 'Failed to cancel order')
    );
  }
};

const getOrderSummary = async (req, res) => {
  try {
    const orders = await supabaseService.getUserOrders(req.user.id);

    const summary = {
      total_orders: orders.length,
      orders_by_status: {},
      total_spent: 0,
      recent_orders: orders.slice(0, 5)
    };

    orders.forEach(order => {
      summary.orders_by_status[order.status] = (summary.orders_by_status[order.status] || 0) + 1;
      summary.total_spent += parseFloat(order.total_amount);
    });

    summary.total_spent = Math.round(summary.total_spent * 100) / 100;

    res.json(
      createResponse(true, summary)
    );

  } catch (error) {
    logger.error('Get order summary error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch order summary')
    );
  }
};

const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await supabaseService.getOrderById(orderId, req.user.id);

    if (!order) {
      return res.status(404).json(
        createResponse(false, null, 'Order not found')
      );
    }

    // Create tracking information based on order status
    const trackingSteps = [
      { status: 'pending', label: 'Order Placed', completed: true, date: order.created_at },
      { status: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status), date: order.updated_at },
      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status), date: order.updated_at },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status), date: order.updated_at },
      { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered', date: order.status === 'delivered' ? order.updated_at : null }
    ];

    const trackingData = {
      order_number: order.order_number,
      current_status: order.status,
      tracking_steps: trackingSteps,
      estimated_delivery: order.status === 'shipped' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    res.json(
      createResponse(true, trackingData)
    );

  } catch (error) {
    logger.error('Track order error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to track order')
    );
  }
};

const reorderItems = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await supabaseService.getOrderById(orderId, req.user.id);

    if (!order) {
      return res.status(404).json(
        createResponse(false, null, 'Order not found')
      );
    }

    // Add order items back to cart
    let addedItems = 0;
    const unavailableItems = [];

    for (const item of order.order_items) {
      try {
        // Check if product is still available
        const product = await supabaseService.getProductById(item.product_id);
        
        if (!product || !product.in_stock) {
          unavailableItems.push(item.product.name);
          continue;
        }

        // Check stock availability
        const hasStock = await supabaseService.checkProductStock(
          item.product_id, 
          item.variant_id, 
          item.quantity
        );

        if (!hasStock) {
          unavailableItems.push(item.product.name);
          continue;
        }

        await supabaseService.addToCart(req.user.id, item.product_id, item.variant_id, item.quantity);
        addedItems++;

      } catch (error) {
        logger.error(`Error adding item to cart: ${item.product.name}`, error);
        unavailableItems.push(item.product.name);
      }
    }

    const message = addedItems > 0 
      ? `${addedItems} items added to cart${unavailableItems.length > 0 ? `. ${unavailableItems.length} items unavailable.` : ''}`
      : 'No items could be added to cart';

    res.json(
      createResponse(true, {
        added_items: addedItems,
        unavailable_items: unavailableItems,
        total_items: order.order_items.length
      }, message)
    );

  } catch (error) {
    logger.error('Reorder items error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to reorder items')
    );
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderSummary,
  trackOrder,
  reorderItems
};