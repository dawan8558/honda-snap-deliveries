-- Add policy to allow operators to view their dealership information
CREATE POLICY "Operators can view their dealership info" 
ON public.dealerships 
FOR SELECT 
USING (
  has_role(auth.uid(), 'operator'::app_role) 
  AND id = (
    SELECT dealership_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);