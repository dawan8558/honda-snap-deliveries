-- First, drop the problematic policy
DROP POLICY IF EXISTS "Dealership admins can view operators in their dealership" ON public.profiles;

-- Create a security definer function to get current user's dealership safely
CREATE OR REPLACE FUNCTION public.get_current_user_dealership()
RETURNS UUID AS $$
  SELECT dealership_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create the correct policy using the security definer function
CREATE POLICY "Dealership admins can view operators in their dealership" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'dealership_admin'::app_role) 
  AND dealership_id = public.get_current_user_dealership()
);