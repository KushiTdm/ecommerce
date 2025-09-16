# Minimal Store - Modern E-Commerce Application

A production-ready e-commerce application built with React, TypeScript, and Supabase, featuring advanced SEO optimization and minimalist design inspired by Make My Lemonade.

## 🚀 Features

### Frontend
- **React 18** with TypeScript for type safety
- **Zustand** for lightweight state management
- **React Router** for client-side routing
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Progressive Web App** features

### Design System
- **Minimalist aesthetic** with carefully curated color palette:
  - Pure white backgrounds (#FFFFFF)
  - Deep black for headings and primary text (#151515)
  - Cool gray for secondary text (#65706E)
  - Light/mid gray for borders (#BFBFBF, #EBEBEB)
  - Very light gray for placeholders (#F4F4F4)

### SEO Optimization
- **Semantic HTML** structure with proper heading hierarchy
- **Dynamic meta tags** for title, description, and Open Graph
- **Structured data** markup for rich snippets
- **Image optimization** with lazy loading and proper alt attributes
- **Sitemap.xml** and **robots.txt** for search engine discovery
- **Clean URLs** with meaningful slugs

### Backend
- **Supabase** for authentication and database
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** database with properly normalized schema
- **Row Level Security** for data protection

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Cart/            # Cart-related components
│   ├── Layout/          # Layout components (Header, Footer)
│   ├── Products/        # Product-related components
│   └── SEO/             # SEO optimization components
├── pages/               # Page components
├── store/               # Zustand store configuration
├── lib/                 # Utilities and configurations
└── App.tsx              # Main application component

prisma/
└── schema.prisma        # Database schema definition

public/
├── sitemap.xml          # Search engine sitemap
└── robots.txt           # Crawler instructions
```

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minimal-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and database URL.

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🎨 Design Guidelines

### Color System
The application uses a minimal color palette for maximum impact:

- **Primary Black (#151515)**: Headers, buttons, important text
- **Secondary Gray (#65706E)**: Body text, less important elements
- **Border Gray (#BFBFBF, #EBEBEB)**: Dividers, card borders
- **Background White (#FFFFFF)**: Main backgrounds
- **Placeholder Gray (#F4F4F4)**: Loading states, empty states

### Typography
- **Font weights**: Regular (400), Medium (500), Bold (700)
- **Hierarchy**: Clear distinction between H1, H2, H3, and body text
- **Line height**: 150% for body text, 120% for headings

### Spacing
- **8px base unit**: All spacing uses multiples of 8px
- **Consistent margins**: 4, 8, 12, 16, 20, 24, 32, 48, 64px
- **Component padding**: Internal spacing follows the 8px grid

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Touch-optimized interactions
- Swipe gestures for carousels
- Collapsible navigation
- Optimized image sizes

## 🔍 SEO Best Practices

### Meta Tags
- Dynamic title tags with brand consistency
- Unique meta descriptions for each page
- Open Graph tags for social sharing
- Twitter Card optimization

### Structured Data
- Product schema markup
- Organization schema
- Breadcrumb navigation
- Review aggregation

### Performance
- Image lazy loading with Intersection Observer
- Critical CSS inlining
- JavaScript code splitting
- Font optimization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are properly configured:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`

### SEO Checklist
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt configured
- [ ] Meta tags validated
- [ ] Structured data tested
- [ ] Page speed optimized
- [ ] Mobile usability verified

## 🔧 Development

### Adding New Products
Products are managed through the Supabase dashboard or API. The schema includes:
- Basic product information (name, price, description)
- Inventory management (inStock)
- Categorization and featuring options
- Image optimization

### State Management
The application uses Zustand for state management with persistence:
- Cart state persisted to localStorage
- User authentication state
- Product catalog management
- UI state (modals, sidebars)

### API Integration
All external API calls should be made through the service layer:
- Centralized error handling
- Consistent response formatting
- Loading state management

## 📊 Analytics & Monitoring

### Recommended Tools
- Google Analytics 4 for user behavior
- Google Search Console for SEO performance
- Core Web Vitals monitoring
- Error tracking (Sentry recommended)

## 🤝 Contributing

1. Follow the established code style
2. Write meaningful commit messages
3. Test responsive design on multiple devices
4. Validate SEO implementation
5. Update documentation for new features

## 📄 License

This project is licensed under the MIT License.# ecommerce
