-- Seed Data for BookitSafari Platform
-- Clean seed file - ready for production data
-- 
-- NOTE: Add your operators, routes, buses, and schedules here
-- Follow the structure below for consistency

-- ============================================
-- BUS OPERATORS - Add your operators here
-- ============================================
-- Example structure (uncomment and modify):
/*
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
) VALUES 
(
  (SELECT id FROM auth.users WHERE email = 'operator@example.com' LIMIT 1),
  'Your Operator Name',
  'https://example.com/logo.png',
  'Description of bus service',
  '+255712345678',
  'operator@example.com',
  'Address',
  'LICENSE-2024-001',
  'approved'
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- BUSES - Add your buses here
-- ============================================
-- Example structure (uncomment and modify):
/*
INSERT INTO public.buses (
  operator_id,
  bus_number,
  plate_number,
  bus_type,
  total_seats,
  amenities,
  seat_layout,
  seat_layout_config,
  is_active
) VALUES 
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Your Operator Name' LIMIT 1),
  'BUS-001',
  'T123 ABC',
  'Luxury',
  57,
  ARRAY['USB Charging', 'AC', 'WiFi'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}, ...]'::jsonb,
  true
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- ROUTES - Add your routes here
-- ============================================
-- Example structure (uncomment and modify):
/*
INSERT INTO public.routes (
  operator_id,
  departure_region_id,
  destination_region_id,
  departure_terminal,
  arrival_terminal,
  duration_hours,
  distance_km,
  is_active
) VALUES 
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Your Operator Name' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Your Departure Terminal',
  'Your Arrival Terminal',
  9.5,
  600,
  true
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- SCHEDULES - Add your schedules here
-- ============================================
-- Example structure (uncomment and modify):
/*
INSERT INTO public.schedules (
  route_id,
  bus_id,
  departure_date,
  departure_time,
  arrival_time,
  price_tzs,
  available_seats,
  is_active
) VALUES 
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Your Departure Terminal' LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T123 ABC' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '17:30:00',
  45000,
  57,
  true
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- AVAILABLE REGIONS (Reference for route creation)
-- ============================================
-- Query to check available regions:
-- SELECT id, name, slug FROM public.regions ORDER BY name;
--
-- Common Tanzania Regions:
-- - Dar es Salaam
-- - Arusha
-- - Dodoma
-- - Mwanza
-- - Kilimanjaro
-- - Iringa
-- - Mbeya
-- - Morogoro
-- - Tanga
-- - Kagera
-- - Manyara
-- - Ruvuma
-- - Katavi
-- - Kigoma
-- - Simiyu
-- - Njombe
-- - Lindi
-- - Pemba
-- - Zanzibar

-- ============================================
-- INSTRUCTIONS FOR DATA ENTRY
-- ============================================
-- 1. Get your operator user_id from auth.users table
-- 2. Get region IDs from regions table
-- 3. Create buses with proper seat_layout_config (JSON format)
-- 4. Create routes linking operators to regions
-- 5. Create schedules for each route and bus combination
-- 6. Test bookings to ensure everything works
--
-- Common Seat Layout Options:
-- - layout1: Standard layout (57 seats with aisles)
-- - layout2: Compact layout (53 seats)
-- - layout3: Full layout (up to 60 seats)

