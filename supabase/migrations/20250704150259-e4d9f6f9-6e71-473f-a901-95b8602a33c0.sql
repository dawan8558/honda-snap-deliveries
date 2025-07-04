-- Create storage policies for delivery-photos bucket to allow operators to upload images

-- Policy to allow operators to insert their own delivery photos
CREATE POLICY "Operators can upload delivery photos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'delivery-photos' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
  )
);

-- Policy to allow operators to view their own delivery photos
CREATE POLICY "Operators can view their delivery photos" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'delivery-photos' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
  )
);

-- Policy to allow dealership admins to view delivery photos from their dealership operators
CREATE POLICY "Dealership admins can view delivery photos from their operators" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'delivery-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() 
    AND p1.role = 'dealership_admin'
    AND p2.id = (storage.foldername(storage.objects.name))[1]::uuid
    AND p2.role = 'operator'
    AND p1.dealership_id = p2.dealership_id
  )
);

-- Policy to allow OEM admins to view all delivery photos
CREATE POLICY "OEM admins can view all delivery photos" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'delivery-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'oem_admin'
  )
);