-- Insert a dev user profile for development using proper UUID
INSERT INTO public.profiles (id, name, email, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Dev User', 'dev@example.com', 'oem_admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;