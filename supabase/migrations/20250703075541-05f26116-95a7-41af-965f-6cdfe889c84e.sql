-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('oem_admin', 'dealership_admin', 'operator');

-- Create dealerships table
CREATE TABLE public.dealerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'operator',
  dealership_id UUID REFERENCES public.dealerships(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT NOT NULL,
  variant TEXT NOT NULL,
  color TEXT NOT NULL,
  relationship_id TEXT,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id),
  is_delivered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frames table
CREATE TABLE public.frames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  dealership_id UUID REFERENCES public.dealerships(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deliveries table
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  operator_id UUID NOT NULL REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  framed_image_urls TEXT[] NOT NULL DEFAULT '{}',
  consent_to_share BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- RLS Policies for dealerships
CREATE POLICY "OEM admins can manage all dealerships" 
ON public.dealerships FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

CREATE POLICY "Dealership admins can view their dealership" 
ON public.dealerships FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'dealership_admin') 
  AND id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

CREATE POLICY "OEM admins can view all profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

-- RLS Policies for vehicles
CREATE POLICY "OEM admins can manage all vehicles" 
ON public.vehicles FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

CREATE POLICY "Dealership admins can view their vehicles" 
ON public.vehicles FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'dealership_admin') 
  AND dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Operators can view their dealership vehicles" 
ON public.vehicles FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'operator') 
  AND dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid())
  AND is_delivered = false
);

-- RLS Policies for frames
CREATE POLICY "OEM admins can manage all frames" 
ON public.frames FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

CREATE POLICY "Dealership admins can manage their frames" 
ON public.frames FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'dealership_admin') 
  AND (dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid()) OR dealership_id IS NULL)
);

CREATE POLICY "Operators can view relevant frames" 
ON public.frames FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'operator') 
  AND (dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid()) OR dealership_id IS NULL)
);

-- RLS Policies for deliveries
CREATE POLICY "OEM admins can view all deliveries" 
ON public.deliveries FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'oem_admin'));

CREATE POLICY "Dealership admins can view their deliveries" 
ON public.deliveries FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'dealership_admin') 
  AND EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
    AND v.dealership_id = (SELECT dealership_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Operators can create deliveries" 
ON public.deliveries FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'operator') 
  AND operator_id = auth.uid()
);

-- Insert sample data
INSERT INTO public.dealerships (name, city) VALUES 
('Honda Karachi Central', 'Karachi'),
('Honda Lahore Main', 'Lahore'),
('Honda Islamabad', 'Islamabad');

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'operator'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();