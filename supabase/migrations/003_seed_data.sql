-- ============================================================
-- VAHISHA E-COMMERCE PLATFORM — MIGRATION 003
-- Seed Data: Categories, Products, Variants, Coupons, Settings
-- Run this AFTER 002_rls_policies.sql
-- NOTE: Admin user must be created via Supabase Auth dashboard
--       first, then promote them with the UPDATE below.
-- ============================================================

-- ============================================================
-- STORE SETTINGS
-- ============================================================

INSERT INTO store_settings (key, value) VALUES
  ('store_name',          '"VAHISHA"'),
  ('store_tagline',       '"Woven with Love. Worn with Pride."'),
  ('store_email',         '"hello@vahisha.in"'),
  ('store_phone',         '"+91 98765 43210"'),
  ('store_address',       '"Mumbai, Maharashtra, India"'),
  ('currency',            '"INR"'),
  ('currency_symbol',     '"₹"'),
  ('free_shipping_above', '499'),
  ('shipping_charge',     '49'),
  ('announcement_bar',    '{"enabled": true, "text": "🎉 Free shipping on orders above ₹499! Use code WELCOME10 for 10% off your first order."}'),
  ('social_links',        '{"instagram": "https://instagram.com/vahisha", "facebook": "https://facebook.com/vahisha", "pinterest": "https://pinterest.com/vahisha"}'),
  ('gst_percentage',      '5'),
  ('return_policy_days',  '7')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Kurtis',        'kurtis',        'Elegant kurtis for every occasion',         'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600', 1, TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Tops & T-Shirts','tops-tshirts',  'Trendy tops and graphic tees',              'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', 2, TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Dresses',        'dresses',       'Flowy and structured dresses',              'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', 3, TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Co-ord Sets',    'coord-sets',    'Matching sets that turn heads',             'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', 4, TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Ethnic Wear',    'ethnic-wear',   'Celebrate traditions in style',             'https://images.unsplash.com/photo-1610189352649-a89e5a3b3b87?w=600', 5, TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Shirts',         'shirts',        'Casual and formal shirts for women',        'https://images.unsplash.com/photo-1594938298603-c8148c4a8fe4?w=600', 6, TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'Loungewear',     'loungewear',    'Comfort-first everyday wear',               'https://images.unsplash.com/photo-1556821840-3a63f15732f2?w=600', 7, TRUE);

-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO products (id, name, slug, description, short_description, category_id, base_price, sale_price, cost_price, sku, fabric, tags, is_active, is_featured, is_new_arrival, is_bestseller) VALUES

-- KURTIS
('f0000000-0000-0000-0000-000000000001',
 'Floral Bloom Kurti',
 'floral-bloom-kurti',
 'A beautiful floral print kurti crafted from premium cotton. Perfect for casual outings and festive gatherings. Features delicate floral motifs with a relaxed A-line silhouette and side slits for ease of movement.',
 'Premium cotton floral print kurti with A-line silhouette.',
 'c1000000-0000-0000-0000-000000000001',
 899, 749, 350, 'VH-KUR-001', 'Cotton', ARRAY['floral','kurti','casual','festive'], TRUE, TRUE, TRUE, TRUE),

('f0000000-0000-0000-0000-000000000002',
 'Anarkali Embroidered Kurti',
 'anarkali-embroidered-kurti',
 'Stunning Anarkali-style kurti with intricate thread embroidery on the neckline and hemline. Crafted from breathable rayon for all-day comfort. A statement piece for festivities.',
 'Rayon Anarkali kurti with thread embroidery on neckline.',
 'c1000000-0000-0000-0000-000000000001',
 1299, 1099, 500, 'VH-KUR-002', 'Rayon', ARRAY['anarkali','embroidered','festive','ethnic'], TRUE, TRUE, FALSE, TRUE),

('f0000000-0000-0000-0000-000000000003',
 'Straight Linen Kurti',
 'straight-linen-kurti',
 'Minimalist straight-cut kurti in pure linen. Features subtle texture and a breathable weave perfect for summer days. Clean silhouette with side slits and mandarin collar.',
 'Pure linen straight-cut kurti — minimal and breathable.',
 'c1000000-0000-0000-0000-000000000001',
 799, 699, 300, 'VH-KUR-003', 'Linen', ARRAY['linen','minimal','summer','straight'], TRUE, FALSE, TRUE, FALSE),

-- TOPS & T-SHIRTS
('f0000000-0000-0000-0000-000000000004',
 'Rose Garden Graphic Tee',
 'rose-garden-graphic-tee',
 'Express yourself with this premium graphic tee featuring an artistic rose garden print. Made from 100% combed cotton for ultimate softness. Relaxed fit, pre-shrunk fabric.',
 '100% combed cotton graphic tee with artistic rose print.',
 'c1000000-0000-0000-0000-000000000002',
 499, 399, 180, 'VH-TOP-001', 'Cotton', ARRAY['graphic-tee','casual','cotton','rose'], TRUE, TRUE, TRUE, TRUE),

('f0000000-0000-0000-0000-000000000005',
 'Puff Sleeve Crop Top',
 'puff-sleeve-crop-top',
 'Trendy puff-sleeve crop top in luxurious satin fabric. Perfect for dinner dates and evening outings. Features an elasticated neckline and invisible back zip.',
 'Satin puff sleeve crop top — evening-ready glam.',
 'c1000000-0000-0000-0000-000000000002',
 699, 599, 250, 'VH-TOP-002', 'Satin', ARRAY['crop-top','puff-sleeve','nightout','satin'], TRUE, TRUE, FALSE, FALSE),

('f0000000-0000-0000-0000-000000000006',
 'Ribbed Fitted Tank',
 'ribbed-fitted-tank',
 'Versatile ribbed tank top that pairs with everything. Crafted from stretch-ribbed jersey for a flattering, body-hugging fit. Available in multiple colors.',
 'Stretch ribbed jersey tank — the ultimate wardrobe staple.',
 'c1000000-0000-0000-0000-000000000002',
 349, 299, 120, 'VH-TOP-003', 'Jersey', ARRAY['tank','ribbed','basic','layering'], TRUE, FALSE, FALSE, TRUE),

-- DRESSES
('f0000000-0000-0000-0000-000000000007',
 'Midnight Wrap Dress',
 'midnight-wrap-dress',
 'Effortlessly elegant wrap dress in deep navy viscose. The wrap silhouette is universally flattering and the tie belt allows for a customizable fit. Perfect for work-to-evening occasions.',
 'Deep navy viscose wrap dress — universally flattering.',
 'c1000000-0000-0000-0000-000000000003',
 1499, 1249, 580, 'VH-DRS-001', 'Viscose', ARRAY['wrap-dress','elegant','office','navy'], TRUE, TRUE, FALSE, TRUE),

('f0000000-0000-0000-0000-000000000008',
 'Sunflower Midi Dress',
 'sunflower-midi-dress',
 'Bright and cheerful sunflower print midi dress in chiffon. Tiered skirt adds beautiful movement. Features adjustable spaghetti straps and a smocked bodice for the perfect fit.',
 'Chiffon sunflower midi dress with tiered skirt.',
 'c1000000-0000-0000-0000-000000000003',
 1199, 999, 450, 'VH-DRS-002', 'Chiffon', ARRAY['midi-dress','floral','summer','chiffon'], TRUE, TRUE, TRUE, FALSE),

-- CO-ORD SETS
('f0000000-0000-0000-0000-000000000009',
 'Pastel Pink Co-ord Set',
 'pastel-pink-coord-set',
 'Dreamy pastel pink co-ord set featuring a cropped blazer and wide-leg trousers. Crafted from premium poly-crepe. Effortlessly chic, perfect for brunches and parties.',
 'Cropped blazer + wide-leg trouser co-ord in pastel pink.',
 'c1000000-0000-0000-0000-000000000004',
 1899, 1599, 750, 'VH-CRD-001', 'Poly-Crepe', ARRAY['coord-set','blazer','wide-leg','pastel','brunch'], TRUE, TRUE, TRUE, TRUE),

('f0000000-0000-0000-0000-000000000010',
 'Earthen Brown Lounge Set',
 'earthen-brown-lounge-set',
 'Relaxed lounge co-ord in earthy brown modal-blend fabric. Includes an oversized hoodie and matching joggers. Soft, cozy, and endlessly stylish.',
 'Modal-blend oversized hoodie + jogger co-ord in earthy brown.',
 'c1000000-0000-0000-0000-000000000004',
 1299, 1099, 500, 'VH-CRD-002', 'Modal', ARRAY['coord-set','lounge','cozy','oversized'], TRUE, FALSE, FALSE, FALSE),

-- ETHNIC WEAR
('f0000000-0000-0000-0000-000000000011',
 'Bandhani Salwar Suit',
 'bandhani-salwar-suit',
 'Traditional Bandhani print salwar suit in vibrant red and yellow. Comes as a 3-piece set: kurta, salwar, and dupatta. Machine-washable georgette fabric.',
 'Vibrant 3-piece Bandhani salwar suit in georgette.',
 'c1000000-0000-0000-0000-000000000005',
 1699, 1399, 650, 'VH-ETH-001', 'Georgette', ARRAY['bandhani','salwar','ethnic','traditional','festive'], TRUE, TRUE, TRUE, TRUE),

-- SHIRTS
('f0000000-0000-0000-0000-000000000012',
 'Classic Oxford Shirt',
 'classic-oxford-shirt',
 'Timeless women''s oxford shirt in premium cotton. Relaxed fit with a button-down collar. Versatile enough for the office and casual weekends. Available in white and light blue.',
 'Premium cotton oxford shirt — office to weekend.',
 'c1000000-0000-0000-0000-000000000006',
 899, 749, 320, 'VH-SHT-001', 'Cotton Oxford', ARRAY['shirt','oxford','office','classic','cotton'], TRUE, FALSE, FALSE, TRUE),

-- LOUNGEWEAR
('f0000000-0000-0000-0000-000000000013',
 'Cloud Cotton PJ Set',
 'cloud-cotton-pj-set',
 'The softest pajama set you''ll ever own. Made from cloud-soft 100% cotton interlock. Features a lightweight long-sleeve top and full-length jogger pants with an elasticized waistband.',
 '100% cotton interlock pajama set — incredibly soft.',
 'c1000000-0000-0000-0000-000000000007',
 799, 699, 280, 'VH-LNG-001', 'Cotton Interlock', ARRAY['pajama','loungewear','sleepwear','cotton','cozy'], TRUE, FALSE, TRUE, TRUE);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES
-- Floral Bloom Kurti
('f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 'Floral Bloom Kurti Front', TRUE, 0),
('f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 'Floral Bloom Kurti Detail', FALSE, 1),
-- Anarkali Kurti
('f0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610189352649-a89e5a3b3b87?w=800', 'Anarkali Kurti Front', TRUE, 0),
-- Graphic Tee
('f0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Rose Garden Graphic Tee', TRUE, 0),
-- Puff Sleeve Crop Top
('f0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', 'Puff Sleeve Crop Top', TRUE, 0),
-- Ribbed Tank
('f0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800', 'Ribbed Fitted Tank', TRUE, 0),
-- Midnight Wrap Dress
('f0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', 'Midnight Wrap Dress', TRUE, 0),
-- Sunflower Midi Dress
('f0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', 'Sunflower Midi Dress', TRUE, 0),
-- Pastel Pink Co-ord
('f0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1594938298603-c8148c4a8fe4?w=800', 'Pastel Pink Co-ord Set', TRUE, 0),
-- Bandhani
('f0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 'Bandhani Salwar Suit', TRUE, 0),
-- Oxford Shirt
('f0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1594938298603-c8148c4a8fe4?w=800', 'Classic Oxford Shirt', TRUE, 0),
-- PJ Set
('f0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1556821840-3a63f15732f2?w=800', 'Cloud Cotton PJ Set', TRUE, 0);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

-- Floral Bloom Kurti
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000001', 'S',  'Peach',     '#FFCBA4', 50, 10),
('f0000000-0000-0000-0000-000000000001', 'M',  'Peach',     '#FFCBA4', 80, 10),
('f0000000-0000-0000-0000-000000000001', 'L',  'Peach',     '#FFCBA4', 60, 10),
('f0000000-0000-0000-0000-000000000001', 'XL', 'Peach',     '#FFCBA4', 30, 10),
('f0000000-0000-0000-0000-000000000001', 'S',  'Sky Blue',  '#87CEEB', 40, 10),
('f0000000-0000-0000-0000-000000000001', 'M',  'Sky Blue',  '#87CEEB', 70, 10),
('f0000000-0000-0000-0000-000000000001', 'L',  'Sky Blue',  '#87CEEB', 50, 10);

-- Graphic Tee
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000004', 'XS', 'White',     '#FFFFFF', 30, 5),
('f0000000-0000-0000-0000-000000000004', 'S',  'White',     '#FFFFFF', 60, 5),
('f0000000-0000-0000-0000-000000000004', 'M',  'White',     '#FFFFFF', 80, 5),
('f0000000-0000-0000-0000-000000000004', 'L',  'White',     '#FFFFFF', 50, 5),
('f0000000-0000-0000-0000-000000000004', 'XL', 'White',     '#FFFFFF', 20, 5),
('f0000000-0000-0000-0000-000000000004', 'S',  'Black',     '#000000', 55, 5),
('f0000000-0000-0000-0000-000000000004', 'M',  'Black',     '#000000', 70, 5),
('f0000000-0000-0000-0000-000000000004', 'L',  'Black',     '#000000', 45, 5);

-- Ribbed Tank
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000006', 'XS', 'Beige',     '#F5F5DC', 40, 8),
('f0000000-0000-0000-0000-000000000006', 'S',  'Beige',     '#F5F5DC', 70, 8),
('f0000000-0000-0000-0000-000000000006', 'M',  'Beige',     '#F5F5DC', 90, 8),
('f0000000-0000-0000-0000-000000000006', 'L',  'Beige',     '#F5F5DC', 60, 8),
('f0000000-0000-0000-0000-000000000006', 'S',  'Black',     '#000000', 80, 8),
('f0000000-0000-0000-0000-000000000006', 'M',  'Black',     '#000000', 100, 8),
('f0000000-0000-0000-0000-000000000006', 'L',  'Black',     '#000000', 70, 8);

-- Midnight Wrap Dress
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000007', 'S',  'Navy',      '#000080', 25, 5),
('f0000000-0000-0000-0000-000000000007', 'M',  'Navy',      '#000080', 40, 5),
('f0000000-0000-0000-0000-000000000007', 'L',  'Navy',      '#000080', 30, 5),
('f0000000-0000-0000-0000-000000000007', 'XL', 'Navy',      '#000080', 15, 5),
('f0000000-0000-0000-0000-000000000007', 'S',  'Burgundy',  '#800020', 20, 5),
('f0000000-0000-0000-0000-000000000007', 'M',  'Burgundy',  '#800020', 35, 5);

-- Pastel Pink Co-ord Set
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000009', 'S',  'Blush Pink', '#FFB6C1', 20, 5),
('f0000000-0000-0000-0000-000000000009', 'M',  'Blush Pink', '#FFB6C1', 35, 5),
('f0000000-0000-0000-0000-000000000009', 'L',  'Blush Pink', '#FFB6C1', 25, 5),
('f0000000-0000-0000-0000-000000000009', 'S',  'Lavender',   '#E6E6FA', 15, 5),
('f0000000-0000-0000-0000-000000000009', 'M',  'Lavender',   '#E6E6FA', 28, 5),
('f0000000-0000-0000-0000-000000000009', 'L',  'Lavender',   '#E6E6FA', 8,  5);

-- Oxford Shirt
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
('f0000000-0000-0000-0000-000000000012', 'S',  'White',     '#FFFFFF', 40, 8),
('f0000000-0000-0000-0000-000000000012', 'M',  'White',     '#FFFFFF', 60, 8),
('f0000000-0000-0000-0000-000000000012', 'L',  'White',     '#FFFFFF', 45, 8),
('f0000000-0000-0000-0000-000000000012', 'XL', 'White',     '#FFFFFF', 20, 8),
('f0000000-0000-0000-0000-000000000012', 'S',  'Light Blue','#ADD8E6', 35, 8),
('f0000000-0000-0000-0000-000000000012', 'M',  'Light Blue','#ADD8E6', 50, 8),
('f0000000-0000-0000-0000-000000000012', 'L',  'Light Blue','#ADD8E6', 30, 8);

-- ============================================================
-- COUPONS
-- ============================================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, is_active, valid_from, valid_until) VALUES
('WELCOME10',   '10% off for first-time customers', 'percentage', 10,   0,    200,  NULL, 1, TRUE,  NOW(), NOW() + INTERVAL '1 year'),
('FLAT100',     'Flat ₹100 off on orders above ₹999', 'flat',     100,  999,  NULL, 500,  1, TRUE,  NOW(), NOW() + INTERVAL '6 months'),
('VAHISHA20',   '20% off sitewide — limited period', 'percentage', 20,  499,  500,  200,  2, TRUE,  NOW(), NOW() + INTERVAL '3 months'),
('ETHNIC15',    '15% off on all ethnic wear',         'percentage', 15,  599,  300,  NULL, 3, TRUE,  NOW(), NOW() + INTERVAL '6 months'),
('NEWSEASON',   '₹200 off new arrivals',              'flat',      200,  1299, NULL, 100,  1, TRUE,  NOW(), NOW() + INTERVAL '2 months'),
('FREESHIP',    'Free shipping on any order',         'flat',      49,   0,    NULL, NULL, 5, TRUE,  NOW(), NOW() + INTERVAL '1 year');

-- ============================================================
-- PROMOTE ADMIN: Run this AFTER creating the admin user via 
-- Supabase Auth dashboard (Authentication > Users > Add User)
-- Replace the email below with your actual admin email.
-- ============================================================

-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@vahisha.in';
