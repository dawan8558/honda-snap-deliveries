-- First, assign existing operators to dealerships (using the first dealership as default)
UPDATE public.profiles 
SET dealership_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE role = 'operator' AND dealership_id IS NULL;

-- Create invitations table for operator management
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL DEFAULT 'operator',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations
CREATE POLICY "Dealership admins can manage their invitations" 
ON public.invitations FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'dealership_admin') 
  AND dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "OEM admins can view all invitations" 
ON public.invitations FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

-- Update deliveries RLS to ensure proper dealership association
DROP POLICY IF EXISTS "Operators can create deliveries" ON public.deliveries;
CREATE POLICY "Operators can create deliveries" 
ON public.deliveries FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'operator') 
  AND operator_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.vehicles v 
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE v.id = vehicle_id 
    AND v.dealership_id = p.dealership_id
  )
);

-- Add constraint to ensure operators have dealership assignments
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_operators_must_have_dealership 
CHECK (role != 'operator' OR dealership_id IS NOT NULL);