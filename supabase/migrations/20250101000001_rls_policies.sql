-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "customers_own_orders" ON orders
  FOR SELECT USING (auth.uid()::text = customer_id::text);

CREATE POLICY "customers_create_orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

CREATE POLICY "customers_own_measurements" ON measurements
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "customers_own_addresses" ON addresses
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Admins can see everything (uses service role key, bypasses RLS)
-- API routes using supabaseAdmin bypass RLS entirely
