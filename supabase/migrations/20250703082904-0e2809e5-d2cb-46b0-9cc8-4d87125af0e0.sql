-- Insert sample dealerships
INSERT INTO public.dealerships (id, name, city) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Honda City Motors', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440002', 'Honda Downtown', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440003', 'Honda Premium', 'Islamabad');

-- Insert sample profiles
INSERT INTO public.profiles (id, name, email, role, dealership_id) VALUES 
('550e8400-e29b-41d4-a716-446655440011', 'John Manager', 'john@hondacity.com', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'Ali Ahmed', 'ali@hondadowntown.com', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440013', 'Sarah Khan', 'sarah@hondapremium.com', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440014', 'Ahmed Operator', 'ahmed@hondacity.com', 'operator', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440015', 'Fatima Worker', 'fatima@hondadowntown.com', 'operator', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440016', 'Hassan Staff', 'hassan@hondapremium.com', 'operator', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440017', 'OEM Admin', 'admin@honda.com', 'oem_admin', NULL);

-- Insert sample vehicles
INSERT INTO public.vehicles (id, model, variant, color, dealership_id, relationship_id, is_delivered) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'City', 'Aspire', 'Pearl White', '550e8400-e29b-41d4-a716-446655440001', 'REL001', false),
('660e8400-e29b-41d4-a716-446655440002', 'City', 'Aspire Prosmatec', 'Brilliant Red', '550e8400-e29b-41d4-a716-446655440001', 'REL002', false),
('660e8400-e29b-41d4-a716-446655440003', 'Civic', 'VTi Oriel', 'Sonic Gray', '550e8400-e29b-41d4-a716-446655440002', 'REL003', false),
('660e8400-e29b-41d4-a716-446655440004', 'Civic', 'RS', 'Championship White', '550e8400-e29b-41d4-a716-446655440002', 'REL004', false),
('660e8400-e29b-41d4-a716-446655440005', 'Accord', 'VTi-L', 'Platinum Silver', '550e8400-e29b-41d4-a716-446655440003', 'REL005', false),
('660e8400-e29b-41d4-a716-446655440006', 'HR-V', 'RS', 'Passion Red', '550e8400-e29b-41d4-a716-446655440003', 'REL006', true),
('660e8400-e29b-41d4-a716-446655440007', 'CR-V', 'Touring', 'Obsidian Blue', '550e8400-e29b-41d4-a716-446655440001', 'REL007', false);

-- Insert sample frames
INSERT INTO public.frames (id, name, model, image_url, uploaded_by, dealership_id) VALUES 
('770e8400-e29b-41d4-a716-446655440001', 'Honda City Premium Frame', 'City', '/placeholder-frame.png', '550e8400-e29b-41d4-a716-446655440017', NULL),
('770e8400-e29b-41d4-a716-446655440002', 'Honda Civic Sport Frame', 'Civic', '/placeholder-frame.png', '550e8400-e29b-41d4-a716-446655440017', NULL),
('770e8400-e29b-41d4-a716-446655440003', 'Honda Accord Executive Frame', 'Accord', '/placeholder-frame.png', '550e8400-e29b-41d4-a716-446655440017', NULL),
('770e8400-e29b-41d4-a716-446655440004', 'Honda HR-V Adventure Frame', 'HR-V', '/placeholder-frame.png', '550e8400-e29b-41d4-a716-446655440017', NULL),
('770e8400-e29b-41d4-a716-446655440005', 'Honda CR-V Family Frame', 'CR-V', '/placeholder-frame.png', '550e8400-e29b-41d4-a716-446655440017', NULL);

-- Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-photos', 'delivery-photos', true);

-- Create policies for delivery photo uploads
CREATE POLICY "Delivery photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'delivery-photos');

CREATE POLICY "Operators can upload delivery photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'delivery-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update delivery photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'delivery-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete delivery photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'delivery-photos' AND auth.role() = 'authenticated');