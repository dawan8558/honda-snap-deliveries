-- Temporarily drop the constraint to allow new operator signups without dealership assignment
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_operators_must_have_dealership;

-- Add a less restrictive constraint that allows NULL dealership_id for new operators
-- They will be assigned later by admins
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_dealership_assignment_check 
CHECK (
  role = 'oem_admin' OR 
  dealership_id IS NOT NULL OR 
  (role = 'operator' AND created_at > now() - INTERVAL '24 hours')
);