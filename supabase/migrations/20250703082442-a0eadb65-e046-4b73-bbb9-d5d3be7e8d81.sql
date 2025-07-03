-- Create storage bucket for frames
INSERT INTO storage.buckets (id, name, public) VALUES ('frames', 'frames', true);

-- Create policies for frame uploads (public read access)
CREATE POLICY "Frames are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'frames');

-- Users can upload frames based on their role
CREATE POLICY "Authenticated users can upload frames" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'frames' AND auth.role() = 'authenticated');

-- Users can update their own frames
CREATE POLICY "Users can update frames" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'frames' AND auth.role() = 'authenticated');

-- Users can delete frames 
CREATE POLICY "Users can delete frames" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'frames' AND auth.role() = 'authenticated');