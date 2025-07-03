-- Insert a dev user profile for development
INSERT INTO public.profiles (id, name, email, role) 
VALUES ('dev-user', 'Dev User', 'dev@example.com', 'oem_admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;