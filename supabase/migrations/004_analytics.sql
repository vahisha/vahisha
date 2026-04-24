-- ============================================================
-- VAHISHA E-COMMERCE PLATFORM — MIGRATION 004
-- Analytics & User Tracking Schema
-- ============================================================

CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES FOR ANALYTICS
-- ============================================================

ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Users can insert their own views
CREATE POLICY "product_views_insert_own" ON product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own views
CREATE POLICY "product_views_select_own" ON product_views
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all views
CREATE POLICY "product_views_select_admin" ON product_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
