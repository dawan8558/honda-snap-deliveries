-- Insert sample dealerships
INSERT INTO public.dealerships (id, name, city) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Honda City Motors', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440002', 'Honda Downtown', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440003', 'Honda Premium', 'Islamabad')
ON CONFLICT (id) DO NOTHING;

-- Insert sample vehicles
INSERT INTO public.vehicles (id, model, variant, color, dealership_id, relationship_id, is_delivered) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'City', 'Aspire', 'Pearl White', '550e8400-e29b-41d4-a716-446655440001', 'REL001', false),
('660e8400-e29b-41d4-a716-446655440002', 'City', 'Aspire Prosmatec', 'Brilliant Red', '550e8400-e29b-41d4-a716-446655440001', 'REL002', false),
('660e8400-e29b-41d4-a716-446655440003', 'Civic', 'VTi Oriel', 'Sonic Gray', '550e8400-e29b-41d4-a716-446655440002', 'REL003', false),
('660e8400-e29b-41d4-a716-446655440004', 'Civic', 'RS', 'Championship White', '550e8400-e29b-41d4-a716-446655440002', 'REL004', false),
('660e8400-e29b-41d4-a716-446655440005', 'Accord', 'VTi-L', 'Platinum Silver', '550e8400-e29b-41d4-a716-446655440003', 'REL005', false),
('660e8400-e29b-41d4-a716-446655440006', 'HR-V', 'RS', 'Passion Red', '550e8400-e29b-41d4-a716-446655440003', 'REL006', true),
('660e8400-e29b-41d4-a716-446655440007', 'CR-V', 'Touring', 'Obsidian Blue', '550e8400-e29b-41d4-a716-446655440001', 'REL007', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-photos', 'delivery-photos', true)
ON CONFLICT (id) DO NOTHING;