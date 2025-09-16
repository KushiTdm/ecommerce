const { Resend } = require('resend');
const logger = require('../utils/logger');
const { formatCurrency } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.EMAIL_SERVICE_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@yourstore.com';
  }

  async sendOrderConfirmation(order, user) {
    try {
      const emailData = {
        from: this.fromEmail,
        to: user.email,
        subject: `Order Confirmation - ${order.order_number}`,
        html: this.generateOrderConfirmationHTML(order, user)
      };

      const result = await this.resend.emails.send(emailData);
      logger.info(`Order confirmation email sent: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(order, user, paymentDetails) {
    try {
      const emailData = {
        from: this.fromEmail,
        to: user.email,
        subject: `Payment Confirmed - ${order.order_number}`,
        html: this.generatePaymentConfirmationHTML(order, user, paymentDetails)
      };

      const result = await this.resend.emails.send(emailData);
      logger.info(`Payment confirmation email sent: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  async sendOrderStatusUpdate(order, user, newStatus) {
    try {
      const emailData = {
        from: this.fromEmail,
        to: user.email,
        subject: `Order Update - ${order.order_number}`,
        html: this.generateOrderStatusUpdateHTML(order, user, newStatus)
      };

      const result = await this.resend.emails.send(emailData);
      logger.info(`Order status update email sent: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Error sending order status update email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const emailData = {
        from: this.fromEmail,
        to: user.email,
        subject: 'Welcome to Minimal Store',
        html: this.generateWelcomeHTML(user)
      };

      const result = await this.resend.emails.send(emailData);
      logger.info(`Welcome email sent: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  generateOrderConfirmationHTML(order, user) {
    const itemsHTML = order.order_items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product.name}
          ${item.variant ? `(${item.variant.name}: ${item.variant.value})` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatCurrency(item.unit_price)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatCurrency(item.total_price)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Order Confirmation
          </h1>
          
          <p>Dear ${user.full_name || user.email},</p>
          
          <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="text-align: right; margin: 20px 0;">
            <p><strong>Subtotal: ${formatCurrency(order.subtotal)}</strong></p>
            <p><strong>Shipping: ${formatCurrency(order.shipping_amount)}</strong></p>
            <p><strong>Tax: ${formatCurrency(order.tax_amount)}</strong></p>
            <p style="font-size: 18px; color: #000;"><strong>Total: ${formatCurrency(order.total_amount)}</strong></p>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <p>We'll send you another email when your order ships with tracking information.</p>
            <p>If you have any questions, please contact our customer service team.</p>
          </div>
          
          <p>Thank you for shopping with us!</p>
          <p>The Minimal Store Team</p>
        </div>
      </body>
      </html>
    `;
  }

  generatePaymentConfirmationHTML(order, user, paymentDetails) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Payment Confirmed
          </h1>
          
          <p>Dear ${user.full_name || user.email},</p>
          
          <p>Your payment has been successfully processed for order ${order.order_number}.</p>
          
          <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">Payment Details</h3>
            <p><strong>Amount Paid:</strong> ${formatCurrency(order.total_amount)}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your order is now being processed and will be shipped soon.</p>
          
          <p>Thank you for your business!</p>
          <p>The Minimal Store Team</p>
        </div>
      </body>
      </html>
    `;
  }

  generateOrderStatusUpdateHTML(order, user, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is currently being processed.',
      shipped: 'Great news! Your order has been shipped.',
      delivered: 'Your order has been delivered. We hope you love it!',
      cancelled: 'Your order has been cancelled. If you have any questions, please contact us.'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Order Status Update
          </h1>
          
          <p>Dear ${user.full_name || user.email},</p>
          
          <p>We have an update on your order ${order.order_number}.</p>
          
          <div style="background: #f0f8ff; padding: 15px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h3>
            <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
          </div>
          
          <p>You can track your order status anytime by logging into your account.</p>
          
          <p>Thank you for choosing Minimal Store!</p>
          <p>The Minimal Store Team</p>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeHTML(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Minimal Store</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Welcome to Minimal Store
          </h1>
          
          <p>Dear ${user.full_name || user.email},</p>
          
          <p>Welcome to Minimal Store! We're excited to have you join our community of people who appreciate quality, sustainable fashion.</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
              <li>Explore our curated collection of minimal fashion pieces</li>
              <li>Save your favorite items to your wishlist</li>
              <li>Enjoy free shipping on orders over $100</li>
              <li>Get early access to new arrivals and sales</li>
            </ul>
          </div>
          
          <p>If you have any questions, our customer service team is here to help.</p>
          
          <p>Happy shopping!</p>
          <p>The Minimal Store Team</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();