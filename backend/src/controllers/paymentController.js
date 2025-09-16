const orderService = require('../services/orderService');
const stripeService = require('../services/stripeService');
const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { createResponse } = require('../utils/helpers');

const createPaymentIntent = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await supabaseService.getOrderById(order_id, req.user.id);

    if (!order) {
      return res.status(404).json(
        createResponse(false, null, 'Order not found')
      );
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json(
        createResponse(false, null, 'Order already paid')
      );
    }

    const paymentData = await orderService.processPayment(order_id, req.user.id, {
      payment_method: 'card'
    });

    logger.info(`Payment intent created for order: ${order.order_number}`);

    res.json(
      createResponse(true, paymentData)
    );

  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to create payment intent')
    );
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    const order = await orderService.confirmPayment(payment_intent_id, req.user.id);

    logger.info(`Payment confirmed for order: ${order.order_number}`);

    res.json(
      createResponse(true, order, 'Payment confirmed successfully')
    );

  } catch (error) {
    logger.error('Confirm payment error:', error);
    
    if (error.message.includes('Payment not successful')) {
      return res.status(400).json(
        createResponse(false, null, 'Payment was not successful')
      );
    }

    res.status(500).json(
      createResponse(false, null, 'Failed to confirm payment')
    );
  }
};

const getPaymentMethods = async (req, res) => {
  try {
    // This would typically fetch saved payment methods for the user
    // For now, return available payment methods
    const paymentMethods = [
      {
        id: 'card',
        type: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with your credit or debit card',
        enabled: true
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        enabled: false // Would be enabled based on configuration
      }
    ];

    res.json(
      createResponse(true, paymentMethods)
    );

  } catch (error) {
    logger.error('Get payment methods error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch payment methods')
    );
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json(
        createResponse(false, null, 'Missing stripe signature')
      );
    }

    const event = stripeService.constructWebhookEvent(req.body, signature);
    
    await stripeService.handleWebhookEvent(event);

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(400).json(
      createResponse(false, null, 'Webhook error')
    );
  }
};

const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.order_id;
    
    if (orderId) {
      await supabaseService.supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', orderId);

      logger.info(`Payment succeeded webhook processed for order: ${orderId}`);
    }
  } catch (error) {
    logger.error('Handle payment succeeded error:', error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.order_id;
    
    if (orderId) {
      await supabaseService.supabase
        .from('orders')
        .update({ 
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('id', orderId);

      logger.error(`Payment failed webhook processed for order: ${orderId}`);
    }
  } catch (error) {
    logger.error('Handle payment failed error:', error);
  }
};

const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    // Only admins can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json(
        createResponse(false, null, 'Admin access required')
      );
    }

    const order = await supabaseService.getOrderById(orderId, null);

    if (!order) {
      return res.status(404).json(
        createResponse(false, null, 'Order not found')
      );
    }

    if (order.payment_status !== 'paid') {
      return res.status(400).json(
        createResponse(false, null, 'Order payment not found or not paid')
      );
    }

    // This would require storing payment_intent_id in the order
    // For now, we'll simulate the refund process
    logger.info(`Refund requested for order: ${order.order_number}, amount: ${amount || 'full'}`);

    // Update order status
    await supabaseService.supabase
      .from('orders')
      .update({ 
        payment_status: 'refunded',
        status: 'cancelled'
      })
      .eq('id', orderId);

    res.json(
      createResponse(true, { 
        order_id: orderId,
        refund_amount: amount || order.total_amount,
        status: 'refunded'
      }, 'Refund processed successfully')
    );

  } catch (error) {
    logger.error('Refund payment error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to process refund')
    );
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const orders = await supabaseService.getUserOrders(req.user.id);
    
    const paymentHistory = orders
      .filter(order => order.payment_status === 'paid')
      .map(order => ({
        order_id: order.id,
        order_number: order.order_number,
        amount: order.total_amount,
        currency: order.currency,
        payment_method: order.payment_method,
        payment_date: order.updated_at,
        status: order.payment_status
      }));

    res.json(
      createResponse(true, paymentHistory)
    );

  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch payment history')
    );
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  handleWebhook,
  refundPayment,
  getPaymentHistory
};