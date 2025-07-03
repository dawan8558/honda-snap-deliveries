-- Create storage bucket for frames
INSERT INTO storage.buckets (id, name, public) VALUES ('frames', 'frames', true)
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