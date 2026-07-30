-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('base_delivery_fee', '150.00', 'number', 'Base fee for standard delivery'),
('urgent_delivery_fee', '300.00', 'number', 'Additional fee for urgent delivery'),
('standard_processing_days', '7', 'number', 'Number of days for standard processing'),
('urgent_processing_days', '3', 'number', 'Number of days for urgent processing');

-- Insert seed users
INSERT INTO users (id, email, phone, phone_verified, email_verified, role, first_name, last_name, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@stitch.pk', '+923001111111', true, true, 'super_admin', 'Admin', 'User', true),
('22222222-2222-2222-2222-222222222222', 'customer@stitch.pk', '+923009999991', true, true, 'customer', 'Test', 'Customer', true),
('33333333-3333-3333-3333-333333333333', 'tailor@stitch.pk', '+923002222222', true, true, 'tailor', 'Master', 'Tailor', true),
('44444444-4444-4444-4444-444444444444', 'qc@stitch.pk', '+923003333333', true, true, 'qc_inspector', 'Quality', 'Checker', true),
('55555555-5555-5555-5555-555555555555', 'delivery@stitch.pk', '+923004444444', true, true, 'delivery_agent', 'Fast', 'Delivery', true);
