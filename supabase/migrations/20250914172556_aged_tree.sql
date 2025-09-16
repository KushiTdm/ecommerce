/*
  # Seed Sample Data

  1. Categories
  2. Products with images and variants
  3. Sample reviews
*/

-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Clothing', 'clothing', 'Essential clothing pieces for modern living', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
('Accessories', 'accessories', 'Carefully curated accessories to complete your look', 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg'),
('Footwear', 'footwear', 'Comfortable and stylish footwear for every occasion', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg');

-- Insert products
INSERT INTO products (name, slug, description, short_description, price, compare_price, category_id, featured, in_stock, stock_quantity, sku, tags, meta_title, meta_description) VALUES
(
  'Minimal White Tee',
  'minimal-white-tee',
  'Essential white t-shirt made from 100% organic cotton. This timeless piece features a relaxed fit and premium construction that gets softer with every wash. Perfect for layering or wearing on its own.',
  'Essential white t-shirt made from organic cotton',
  49.00,
  59.00,
  (SELECT id FROM categories WHERE slug = 'clothing'),
  true,
  true,
  50,
  'MWT-001',
  ARRAY['organic', 'cotton', 'basic', 'white'],
  'Minimal White Tee - Organic Cotton T-Shirt',
  'Premium organic cotton white t-shirt with relaxed fit. Sustainable fashion for modern living.'
),
(
  'Classic Black Jeans',
  'classic-black-jeans',
  'Premium black denim crafted from sustainable cotton blend. Features a modern slim fit with just the right amount of stretch for comfort and mobility. Designed to be your go-to pair for any occasion.',
  'Premium black denim with perfect fit',
  89.00,
  109.00,
  (SELECT id FROM categories WHERE slug = 'clothing'),
  true,
  true,
  30,
  'CBJ-001',
  ARRAY['denim', 'black', 'sustainable', 'slim-fit'],
  'Classic Black Jeans - Premium Sustainable Denim',
  'High-quality black jeans made from sustainable cotton blend with modern slim fit.'
),
(
  'Leather Crossbody Bag',
  'leather-crossbody-bag',
  'Handcrafted leather crossbody bag made from full-grain leather. Features adjustable strap, interior pockets, and timeless design that ages beautifully. Perfect size for daily essentials.',
  'Handcrafted leather bag for everyday use',
  129.00,
  149.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  true,
  true,
  25,
  'LCB-001',
  ARRAY['leather', 'handcrafted', 'crossbody', 'full-grain'],
  'Leather Crossbody Bag - Handcrafted Full-Grain Leather',
  'Premium handcrafted crossbody bag made from full-grain leather with timeless design.'
),
(
  'Minimalist Watch',
  'minimalist-watch',
  'Clean design watch with genuine leather strap and Swiss movement. Features sapphire crystal glass, water resistance, and understated elegance that complements any outfit.',
  'Clean design watch with leather strap',
  199.00,
  249.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  true,
  true,
  15,
  'MW-001',
  ARRAY['watch', 'leather', 'swiss', 'minimalist'],
  'Minimalist Watch - Swiss Movement Leather Strap',
  'Elegant minimalist watch with Swiss movement and genuine leather strap.'
),
(
  'Organic Cotton Hoodie',
  'organic-cotton-hoodie',
  'Comfortable hoodie made from organic cotton fleece. Features kangaroo pocket, adjustable drawstring hood, and relaxed fit. Perfect for casual wear and layering.',
  'Comfortable organic cotton hoodie',
  79.00,
  null,
  (SELECT id FROM categories WHERE slug = 'clothing'),
  false,
  true,
  40,
  'OCH-001',
  ARRAY['hoodie', 'organic', 'cotton', 'casual'],
  'Organic Cotton Hoodie - Comfortable Casual Wear',
  'Soft organic cotton hoodie with kangaroo pocket and adjustable hood.'
),
(
  'Canvas Sneakers',
  'canvas-sneakers',
  'Classic canvas sneakers with rubber sole and cotton laces. Timeless design that pairs well with any casual outfit. Comfortable and durable construction.',
  'Classic canvas sneakers with rubber sole',
  69.00,
  null,
  (SELECT id FROM categories WHERE slug = 'footwear'),
  false,
  true,
  35,
  'CS-001',
  ARRAY['sneakers', 'canvas', 'casual', 'classic'],
  'Canvas Sneakers - Classic Casual Footwear',
  'Comfortable canvas sneakers with rubber sole and timeless design.'
);

-- Insert product images
INSERT INTO product_images (product_id, url, alt_text, position) VALUES
-- Minimal White Tee
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'Minimal White Tee - Front View', 0),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'Minimal White Tee - Side View', 1),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg', 'Minimal White Tee - Detail View', 2),

-- Classic Black Jeans
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'Classic Black Jeans - Front View', 0),
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'Classic Black Jeans - Side View', 1),

-- Leather Crossbody Bag
((SELECT id FROM products WHERE slug = 'leather-crossbody-bag'), 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg', 'Leather Crossbody Bag - Main View', 0),
((SELECT id FROM products WHERE slug = 'leather-crossbody-bag'), 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg', 'Leather Crossbody Bag - Detail View', 1),

-- Minimalist Watch
((SELECT id FROM products WHERE slug = 'minimalist-watch'), 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg', 'Minimalist Watch - Main View', 0),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg', 'Minimalist Watch - Side View', 1),

-- Organic Cotton Hoodie
((SELECT id FROM products WHERE slug = 'organic-cotton-hoodie'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'Organic Cotton Hoodie - Front View', 0),

-- Canvas Sneakers
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 'Canvas Sneakers - Main View', 0);

-- Insert product variants (sizes)
INSERT INTO product_variants (product_id, name, value, stock_quantity) VALUES
-- Minimal White Tee sizes
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'Size', 'XS', 10),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'Size', 'S', 15),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'Size', 'M', 20),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'Size', 'L', 15),
((SELECT id FROM products WHERE slug = 'minimal-white-tee'), 'Size', 'XL', 10),

-- Classic Black Jeans sizes
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'Size', '28', 5),
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'Size', '30', 8),
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'Size', '32', 10),
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'Size', '34', 8),
((SELECT id FROM products WHERE slug = 'classic-black-jeans'), 'Size', '36', 5),

-- Organic Cotton Hoodie sizes
((SELECT id FROM products WHERE slug = 'organic-cotton-hoodie'), 'Size', 'S', 10),
((SELECT id FROM products WHERE slug = 'organic-cotton-hoodie'), 'Size', 'M', 15),
((SELECT id FROM products WHERE slug = 'organic-cotton-hoodie'), 'Size', 'L', 12),
((SELECT id FROM products WHERE slug = 'organic-cotton-hoodie'), 'Size', 'XL', 8),

-- Canvas Sneakers sizes
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'Size', '7', 5),
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'Size', '8', 8),
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'Size', '9', 10),
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'Size', '10', 8),
((SELECT id FROM products WHERE slug = 'canvas-sneakers'), 'Size', '11', 5);