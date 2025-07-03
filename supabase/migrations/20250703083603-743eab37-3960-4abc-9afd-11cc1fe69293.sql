-- Insert sample user profiles for testing
INSERT INTO public.profiles (id, name, email, role, dealership_id) VALUES 
-- OEM Admin
('11111111-1111-1111-1111-111111111111', 'Admin Honda Pakistan', 'admin@honda.pk', 'oem_admin', NULL),
-- Dealership Admins
('22222222-2222-2222-2222-222222222222', 'Manager Karachi', 'manager.karachi@honda.pk', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440001'),
('33333333-3333-3333-3333-333333333333', 'Manager Lahore', 'manager.lahore@honda.pk', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440002'),
('44444444-4444-4444-4444-444444444444', 'Manager Islamabad', 'manager.islamabad@honda.pk', 'dealership_admin', '550e8400-e29b-41d4-a716-446655440003'),
-- Operators
('55555555-5555-5555-5555-555555555555', 'Ali Ahmed', 'ali.ahmed@honda.pk', 'operator', '550e8400-e29b-41d4-a716-446655440001'),
('66666666-6666-6666-6666-666666666666', 'Sara Khan', 'sara.khan@honda.pk', 'operator', '550e8400-e29b-41d4-a716-446655440002'),
('77777777-7777-7777-7777-777777777777', 'Ahmed Hassan', 'ahmed.hassan@honda.pk', 'operator', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for frames
INSERT INTO storage.buckets (id, name, public) VALUES ('frames', 'frames', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample frames with proper image URLs (we'll update these with actual uploaded images)
INSERT INTO public.frames (id, name, model, image_url, uploaded_by, dealership_id) VALUES 
('880e8400-e29b-41d4-a716-446655440001', 'Honda City Premium Frame', 'City', '/placeholder-frame.png', '11111111-1111-1111-1111-111111111111', NULL),
('880e8400-e29b-41d4-a716-446655440002', 'Honda Civic Sport Frame', 'Civic', '/placeholder-frame.png', '11111111-1111-1111-1111-111111111111', NULL),
('880e8400-e29b-41d4-a716-446655440003', 'Honda Accord Executive Frame', 'Accord', '/placeholder-frame.png', '11111111-1111-1111-1111-111111111111', NULL),
('880e8400-e29b-41d4-a716-446655440004', 'Honda HR-V Adventure Frame', 'HR-V', '/placeholder-frame.png', '11111111-1111-1111-1111-111111111111', NULL),
('880e8400-e29b-41d4-a716-446655440005', 'Honda CR-V Family Frame', 'CR-V', '/placeholder-frame.png', '11111111-1111-1111-1111-111111111111', NULL),
-- Dealership-specific frames
('880e8400-e29b-41d4-a716-446655440006', 'Karachi City Special Frame', 'City', '/placeholder-frame.png', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440007', 'Lahore Civic Custom Frame', 'Civic', '/placeholder-frame.png', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for frames bucket
CREATE POLICY "Frames are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'frames');

CREATE POLICY "Authenticated users can upload frames" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'frames' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update frames" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'frames' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete frames" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'frames' AND auth.role() = 'authenticated');