-- ============================================================
-- VAHISHA E-COMMERCE PLATFORM — MIGRATION 002
-- Row Level Security Policies
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: check if user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer');

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- CATEGORIES policies
-- ============================================================

-- Everyone (including anon) can read active categories
CREATE POLICY "categories_select_active" ON categories
  FOR SELECT USING (is_active = TRUE OR is_admin());

-- Only admins can mutate categories
CREATE POLICY "categories_all_admin" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- PRODUCTS policies
-- ============================================================

-- Public can read active products
CREATE POLICY "products_select_active" ON products
  FOR SELECT USING (is_active = TRUE OR is_admin());

-- Only admins can mutate
CREATE POLICY "products_all_admin" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- PRODUCT IMAGES policies
-- ============================================================

CREATE POLICY "product_images_select" ON product_images
  FOR SELECT USING (TRUE);

CREATE POLICY "product_images_all_admin" ON product_images
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- PRODUCT VARIANTS policies
-- ============================================================

CREATE POLICY "variants_select" ON product_variants
  FOR SELECT USING (TRUE);

CREATE POLICY "variants_all_admin" ON product_variants
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- ADDRESSES policies
-- ============================================================

-- Users manage their own addresses
CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- COUPONS policies
-- ============================================================

-- Authenticated users can validate coupon codes (read active ones by code)
CREATE POLICY "coupons_select_active" ON coupons
  FOR SELECT USING (is_active = TRUE OR is_admin());

-- Only admins can mutate coupons
CREATE POLICY "coupons_all_admin" ON coupons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- CART ITEMS policies
-- ============================================================

CREATE POLICY "cart_select_own" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_insert_own" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_update_own" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_delete_own" ON cart_items
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- WISHLISTS policies
-- ============================================================

CREATE POLICY "wishlist_select_own" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_insert_own" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_delete_own" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ORDERS policies
-- ============================================================

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update order status
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (is_admin());

-- ============================================================
-- ORDER ITEMS policies
-- ============================================================

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- COUPON USAGE policies
-- ============================================================

CREATE POLICY "coupon_usage_select" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "coupon_usage_insert" ON coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REVIEWS policies
-- ============================================================

-- Public can see approved reviews
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = user_id OR is_admin());

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- STORE SETTINGS policies
-- ============================================================

-- Public can read store settings
CREATE POLICY "settings_select" ON store_settings
  FOR SELECT USING (TRUE);

-- Only admins can mutate
CREATE POLICY "settings_all_admin" ON store_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
