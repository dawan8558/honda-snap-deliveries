-- Insert sample frames for Honda models using the existing frame assets
-- These frames will be available to all dealerships (dealership_id = NULL means global frames)

INSERT INTO public.frames (name, model, image_url, uploaded_by, dealership_id) VALUES
('Honda Accord Standard Frame', 'Accord', '/src/assets/frames/honda-accord-frame.png', (SELECT id FROM auth.users LIMIT 1), NULL),
('Honda City Standard Frame', 'City', '/src/assets/frames/honda-city-frame.png', (SELECT id FROM auth.users LIMIT 1), NULL),
('Honda Civic Standard Frame', 'Civic', '/src/assets/frames/honda-civic-frame.png', (SELECT id FROM auth.users LIMIT 1), NULL),
('Honda CR-V Standard Frame', 'CR-V', '/src/assets/frames/honda-crv-frame.png', (SELECT id FROM auth.users LIMIT 1), NULL),
('Honda HR-V Standard Frame', 'HR-V', '/src/assets/frames/honda-hrv-frame.png', (SELECT id FROM auth.users LIMIT 1), NULL);

-- Create some sample dealerships if they don't exist
INSERT INTO public.dealerships (name, city) VALUES
('Honda Delhi Central', 'New Delhi'),
('Honda Mumbai West', 'Mumbai'),
('Honda Bangalore South', 'Bangalore')
ON CONFLICT DO NOTHING;

-- Create sample vehicles for testing
INSERT INTO public.vehicles (model, variant, color, dealership_id, is_delivered) VALUES
('Accord', 'VTi-L', 'Pearl White', (SELECT id FROM dealerships WHERE name = 'Honda Delhi Central' LIMIT 1), false),
('City', 'VTi', 'Metallic Silver', (SELECT id FROM dealerships WHERE name = 'Honda Delhi Central' LIMIT 1), false),
('Civic', 'RS', 'Championship White', (SELECT id FROM dealerships WHERE name = 'Honda Mumbai West' LIMIT 1), false),
('CR-V', 'VTi-L', 'Modern Steel Metallic', (SELECT id FROM dealerships WHERE name = 'Honda Mumbai West' LIMIT 1), false),
('HR-V', 'VTi-S', 'Passion Red Pearl', (SELECT id FROM dealerships WHERE name = 'Honda Bangalore South' LIMIT 1), false),
('Accord', 'Sport', 'Crystal Black Pearl', (SELECT id FROM dealerships WHERE name = 'Honda Bangalore South' LIMIT 1), false);