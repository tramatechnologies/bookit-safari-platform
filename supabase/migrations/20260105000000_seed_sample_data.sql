-- Seed sample data for testing
-- This migration creates sample operators, buses, routes, and schedules for testing

-- Note: This seed data requires existing regions and auth users
-- Make sure regions are already inserted (from initial migration)

-- Sample Bus Operators
-- Note: These require auth.users entries first, so we'll use a function that handles this
-- For actual seeding, operators should be created through the registration flow

-- Sample data structure (commented out - requires actual user IDs):
/*
-- Example: Create a test operator (requires auth user first)
-- 1. Create auth user via Supabase Auth
-- 2. Then insert operator:

INSERT INTO public.bus_operators (
  user_id,
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'USER_UUID_HERE', -- Replace with actual auth user UUID
  'Kilimanjaro Express',
  'https://example.com/logo.png', -- Optional logo URL
  'Premium bus service connecting major cities in Tanzania',
  '+255712345678',
  'info@kilimanjaroexpress.co.tz',
  'Ubungo Bus Terminal, Dar es Salaam',
  'LIC-2024-001',
  'approved'
);

-- Example: Create buses for the operator
INSERT INTO public.buses (
  operator_id,
  bus_number,
  plate_number,
  bus_type,
  total_seats,
  amenities,
  seat_layout,
  is_active
) VALUES (
  'OPERATOR_UUID_HERE', -- Replace with operator UUID
  'BUS-001',
  'T123 ABC',
  'Luxury',
  45,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet'],
  'layout1',
  true
),
(
  'OPERATOR_UUID_HERE',
  'BUS-002',
  'T456 DEF',
  'Semi Luxury',
  50,
  ARRAY['USB Charging', 'AC', 'Refreshments'],
  'layout2',
  true
);

-- Example: Create routes
INSERT INTO public.routes (
  operator_id,
  departure_region_id,
  destination_region_id,
  departure_terminal,
  arrival_terminal,
  duration_hours,
  distance_km,
  is_active
) VALUES (
  'OPERATOR_UUID_HERE',
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Ubungo Bus Terminal',
  'Arusha Bus Station',
  9.5,
  600,
  true
);

-- Example: Create schedules
INSERT INTO public.schedules (
  route_id,
  bus_id,
  departure_date,
  departure_time,
  arrival_time,
  price_tzs,
  available_seats,
  is_active
) VALUES (
  'ROUTE_UUID_HERE',
  'BUS_UUID_HERE',
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '17:30:00',
  45000,
  45,
  true
);
*/

-- This is a template seed file
-- To use it:
-- 1. Create auth users via Supabase Auth dashboard or API
-- 2. Replace USER_UUID_HERE with actual user UUIDs
-- 3. Replace OPERATOR_UUID_HERE, ROUTE_UUID_HERE, BUS_UUID_HERE with actual UUIDs
-- 4. Uncomment and execute the INSERT statements

-- For automated testing, consider using Supabase's seed script feature
-- or create a separate script that handles user creation first

