-- Add policy to allow dealership admins to view operators in their dealership
CREATE POLICY "Dealership admins can view operators in their dealership" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'dealership_admin'::app_role) 
  AND dealership_id = (
    SELECT dealership_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);