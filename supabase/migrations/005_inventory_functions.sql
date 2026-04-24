-- ============================================================
-- VAHISHA E-COMMERCE PLATFORM — MIGRATION 005
-- Atomic Inventory Management (RPC)
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_stock(target_variant_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - amount
  WHERE id = target_variant_id
    AND stock_quantity >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', target_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_stock(target_variant_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + amount
  WHERE id = target_variant_id;
END;
$$ LANGUAGE plpgsql;
