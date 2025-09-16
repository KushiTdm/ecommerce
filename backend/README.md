# E-commerce Backend API

A complete Node.js/Express backend API for an e-commerce application with Supabase integration.

## Features

- **Authentication & Authorization**: JWT-based auth with Supabase
- **Product Management**: Full product catalog with search and filtering
- **Shopping Cart**: Complete cart management with stock validation
- **Order Management**: Atomic order creation with stock management
- **Payment Processing**: Stripe integration with webhook handling
- **Email Notifications**: Automated emails for orders and payments
- **User Management**: Profiles, wishlist, addresses, and reviews

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Products
- `GET /api/v1/products` - Get products with filtering
- `GET /api/v1/products/:id` - Get single product
- `GET /api/v1/products/categories` - Get categories
- `GET /api/v1/products/search` - Search products

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/:itemId` - Update cart item
- `DELETE /api/v1/cart/:itemId` - Remove cart item

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get single order
- `PUT /api/v1/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/v1/payments/create-intent` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/webhook` - Stripe webhook

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_SERVICE_API_KEY=...
EMAIL_FROM=noreply@yourstore.com

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Business Logic

### Order Creation Flow
1. Validate cart items and stock availability
2. Calculate order totals server-side
3. Create order and order items atomically
4. Update product stock quantities
5. Clear user's cart
6. Send order confirmation email

### Payment Processing
1. Create Stripe PaymentIntent with order metadata
2. Handle payment confirmation via webhook
3. Update order status and send confirmation email
4. Process refunds for cancelled orders

### Stock Management
- Real-time stock validation before adding to cart
- Atomic stock updates during order creation
- Stock restoration for cancelled orders

## Error Handling

The API uses centralized error handling with:
- Proper HTTP status codes
- Consistent error response format
- Detailed logging for debugging
- Graceful error messages for users

## Security Features

- JWT authentication with Supabase
- Input validation with Joi
- Rate limiting
- CORS configuration
- SQL injection prevention
- Secure password handling

## Development

```bash
# Development with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

1. Set production environment variables
2. Build and deploy to your preferred platform
3. Configure Stripe webhooks
4. Set up email service
5. Configure database connection pooling

## API Documentation

Visit `http://localhost:3001/api/v1` for API documentation and available endpoints.

## Support

For issues and questions, please check the logs in the `logs/` directory or contact the development team.