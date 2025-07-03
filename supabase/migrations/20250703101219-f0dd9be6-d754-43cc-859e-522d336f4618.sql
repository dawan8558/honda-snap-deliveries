-- Fix data consistency issues
-- 1. Assign the dealership admin to a specific dealership
UPDATE public.profiles 
SET dealership_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'dawan8558@gmail.com' AND role = 'dealership_admin';

-- 2. Update the trigger to assign operators to dealerships based on invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if there's a valid invitation for this email
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE email = NEW.email 
    AND accepted = false 
    AND expires_at > now() 
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- User was invited - use invitation details
    INSERT INTO public.profiles (id, name, email, role, dealership_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      invitation_record.role,
      invitation_record.dealership_id
    );
    
    -- Mark invitation as accepted
    UPDATE public.invitations 
    SET accepted = true 
    WHERE id = invitation_record.id;
  ELSE
    -- Regular signup - default to operator role with no dealership (will need manual assignment)
    INSERT INTO public.profiles (id, name, email, role, dealership_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      'operator',
      NULL -- Will be assigned later by admin
    );
  END IF;
  
  RETURN NEW;
END;
$$;