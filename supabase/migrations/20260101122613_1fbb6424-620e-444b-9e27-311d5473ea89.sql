-- Create custom types
CREATE TYPE public.user_role AS ENUM ('passenger', 'operator', 'admin');
CREATE TYPE public.operator_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'passenger',
  UNIQUE(user_id, role)
);

-- Create regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create terminals table
CREATE TABLE public.terminals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bus_operators table
CREATE TABLE public.bus_operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  license_number TEXT,
  status operator_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buses table
CREATE TABLE public.buses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.bus_operators(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  bus_type TEXT NOT NULL, -- Luxury, Semi-Luxury, Standard
  total_seats INTEGER NOT NULL DEFAULT 45,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.bus_operators(id) ON DELETE CASCADE,
  departure_region_id UUID NOT NULL REFERENCES public.regions(id),
  arrival_region_id UUID NOT NULL REFERENCES public.regions(id),
  departure_terminal_id UUID REFERENCES public.terminals(id),
  arrival_terminal_id UUID REFERENCES public.terminals(id),
  distance_km INTEGER,
  estimated_duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  price_tzs INTEGER NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,0}', -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trips table (actual instances of scheduled trips)
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  trip_date DATE NOT NULL,
  available_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, trip_date)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  booking_reference TEXT NOT NULL UNIQUE,
  seat_numbers INTEGER[] NOT NULL,
  total_amount_tzs INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount_tzs INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- mpesa, tigopesa, airtel, card
  payment_reference TEXT,
  clickpesa_transaction_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seat_locks table (for preventing double booking)
CREATE TABLE public.seat_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, seat_number)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's operator_id
CREATE OR REPLACE FUNCTION public.get_user_operator_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.bus_operators WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles (admin only management)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for regions (public read, admin write)
CREATE POLICY "Anyone can view regions" ON public.regions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage regions" ON public.regions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for terminals (public read, admin write)
CREATE POLICY "Anyone can view terminals" ON public.terminals
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage terminals" ON public.terminals
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bus_operators
CREATE POLICY "Anyone can view approved operators" ON public.bus_operators
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register as operators" ON public.bus_operators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Operators can update their own info" ON public.bus_operators
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete operators" ON public.bus_operators
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for buses
CREATE POLICY "Anyone can view active buses" ON public.buses
  FOR SELECT USING (is_active = true OR 
    operator_id = public.get_user_operator_id(auth.uid()) OR 
    public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can manage their buses" ON public.buses
  FOR ALL USING (operator_id = public.get_user_operator_id(auth.uid()) OR 
    public.has_role(auth.uid(), 'admin'));

-- RLS Policies for routes
CREATE POLICY "Anyone can view active routes" ON public.routes
  FOR SELECT USING (is_active = true OR 
    operator_id = public.get_user_operator_id(auth.uid()) OR 
    public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can manage their routes" ON public.routes
  FOR ALL USING (operator_id = public.get_user_operator_id(auth.uid()) OR 
    public.has_role(auth.uid(), 'admin'));

-- RLS Policies for schedules
CREATE POLICY "Anyone can view active schedules" ON public.schedules
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can manage their schedules" ON public.schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routes r 
      WHERE r.id = route_id 
      AND r.operator_id = public.get_user_operator_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for trips
CREATE POLICY "Anyone can view trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "System can manage trips" ON public.trips
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

-- RLS Policies for seat_locks
CREATE POLICY "Anyone can view seat locks" ON public.seat_locks
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own locks" ON public.seat_locks
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bus_operators_updated_at
  BEFORE UPDATE ON public.bus_operators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buses_updated_at
  BEFORE UPDATE ON public.buses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'));
  
  -- Assign default passenger role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'passenger');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate booking reference function
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := 'STZ-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  RETURN ref;
END;
$$;

-- Insert initial Tanzania regions data
INSERT INTO public.regions (name, slug, is_popular) VALUES
  ('Arusha', 'arusha', true),
  ('Dar es Salaam', 'dar-es-salaam', true),
  ('Dodoma', 'dodoma', true),
  ('Geita', 'geita', false),
  ('Iringa', 'iringa', false),
  ('Kagera', 'kagera', false),
  ('Katavi', 'katavi', false),
  ('Kigoma', 'kigoma', false),
  ('Kilimanjaro', 'kilimanjaro', true),
  ('Lindi', 'lindi', false),
  ('Manyara', 'manyara', false),
  ('Mara', 'mara', false),
  ('Mbeya', 'mbeya', true),
  ('Morogoro', 'morogoro', true),
  ('Mtwara', 'mtwara', false),
  ('Mwanza', 'mwanza', true),
  ('Njombe', 'njombe', false),
  ('Pemba North', 'pemba-north', false),
  ('Pemba South', 'pemba-south', false),
  ('Pwani (Coast)', 'pwani', false),
  ('Rukwa', 'rukwa', false),
  ('Ruvuma', 'ruvuma', false),
  ('Shinyanga', 'shinyanga', false),
  ('Simiyu', 'simiyu', false),
  ('Singida', 'singida', false),
  ('Songwe', 'songwe', false),
  ('Tabora', 'tabora', false),
  ('Tanga', 'tanga', true),
  ('Unguja North (Zanzibar)', 'unguja-north', false),
  ('Unguja South (Zanzibar)', 'unguja-south', false),
  ('Zanzibar City', 'zanzibar-city', true);