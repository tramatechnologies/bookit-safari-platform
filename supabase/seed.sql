-- Seed Data for BookitSafari Platform
-- This file contains sample data that matches the current schema implementation
-- 
-- IMPORTANT: This seed data requires:
-- 1. Existing auth.users (create via Supabase Auth dashboard or API first)
-- 2. Existing regions (already inserted in initial migration)
--
-- To use this seed file:
-- 1. Create test users via Supabase Auth
-- 2. Replace USER_UUID placeholders with actual user UUIDs
-- 3. Execute this file via Supabase SQL Editor or CLI

-- ============================================
-- SAMPLE BUS OPERATORS
-- ============================================
-- Note: Replace 'OPERATOR_USER_UUID_1', 'OPERATOR_USER_UUID_2' with actual auth user UUIDs

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
  'OPERATOR_USER_UUID_1', -- Replace with actual UUID
  'Kilimanjaro Express',
  'https://example.com/logos/kilimanjaro-express.png', -- Optional: Upload logo to storage
  'Premium bus service connecting major cities across Tanzania with luxury and semi-luxury buses.',
  '+255712345678',
  'info@kilimanjaroexpress.co.tz',
  'Ubungo Bus Terminal, Dar es Salaam',
  'LIC-2024-KE-001',
  'approved'
),
(
  'OPERATOR_USER_UUID_2', -- Replace with actual UUID
  'Scandinavian Express',
  'https://example.com/logos/scandinavian-express.png',
  'Reliable and comfortable bus services across Tanzania.',
  '+255765432109',
  'contact@scandinavianexpress.co.tz',
  'Arusha Bus Station, Arusha',
  'LIC-2024-SE-001',
  'approved'
);
*/

-- ============================================
-- SAMPLE BUSES
-- ============================================
-- Note: Replace 'OPERATOR_UUID_1', 'OPERATOR_UUID_2' with actual operator UUIDs from above

/*
INSERT INTO public.buses (
  operator_id,
  bus_number,
  plate_number,
  bus_type,
  total_seats,
  amenities,
  seat_layout,
  is_active
) VALUES 
-- Kilimanjaro Express Buses
(
  'OPERATOR_UUID_1', -- Kilimanjaro Express
  'KE-001',
  'T123 ABC',
  'Luxury',
  45,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet'],
  'layout1',
  true
),
(
  'OPERATOR_UUID_1',
  'KE-002',
  'T124 DEF',
  'Luxury',
  50,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet', 'WiFi'],
  'layout2',
  true
),
(
  'OPERATOR_UUID_1',
  'KE-003',
  'T125 GHI',
  'Semi Luxury',
  45,
  ARRAY['USB Charging', 'AC', 'Refreshments'],
  'layout1',
  true
),
-- Scandinavian Express Buses
(
  'OPERATOR_UUID_2', -- Scandinavian Express
  'SE-001',
  'T456 JKL',
  'Luxury',
  45,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet'],
  'layout1',
  true
),
(
  'OPERATOR_UUID_2',
  'SE-002',
  'T457 MNO',
  'Semi Luxury',
  50,
  ARRAY['USB Charging', 'AC', 'Refreshments'],
  'layout2',
  true
);
*/

-- ============================================
-- SAMPLE ROUTES
-- ============================================
-- Note: Replace 'OPERATOR_UUID_1', 'OPERATOR_UUID_2' with actual operator UUIDs

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
-- Kilimanjaro Express Routes
(
  'OPERATOR_UUID_1',
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Ubungo Bus Terminal',
  'Arusha Bus Station',
  9.5,
  600,
  true
),
(
  'OPERATOR_UUID_1',
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1),
  'Ubungo Bus Terminal',
  'Mwanza Bus Station',
  14.0,
  1100,
  true
),
(
  'OPERATOR_UUID_1',
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1),
  'Ubungo Bus Terminal',
  'Dodoma Bus Station',
  6.5,
  450,
  true
),
-- Scandinavian Express Routes
(
  'OPERATOR_UUID_2',
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  'Arusha Bus Station',
  'Ubungo Bus Terminal',
  9.5,
  600,
  true
),
(
  'OPERATOR_UUID_2',
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1),
  'Arusha Bus Station',
  'Moshi Bus Station',
  1.5,
  100,
  true
);
*/

-- ============================================
-- SAMPLE SCHEDULES
-- ============================================
-- Note: Replace 'ROUTE_UUID' and 'BUS_UUID' with actual UUIDs from above
-- Schedules are date-specific (departure_date), not recurring

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
-- Example: Tomorrow's schedules
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Arusha Bus Station' LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T123 ABC' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '17:30:00',
  45000,
  45,
  true
),
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Arusha Bus Station' LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T124 DEF' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  '23:30:00',
  50000,
  50,
  true
),
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Mwanza Bus Station' LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T125 GHI' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '18:00:00',
  '08:00:00', -- Next day arrival
  55000,
  45,
  true
);
*/

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. Create auth users first via Supabase Auth dashboard:
--    - Go to Authentication > Users > Add User
--    - Create users with email/password or use test emails
--    - Copy the user UUIDs
--
-- 2. Update the INSERT statements above:
--    - Replace 'OPERATOR_USER_UUID_1', 'OPERATOR_USER_UUID_2' with actual user UUIDs
--    - Uncomment the INSERT statements
--    - Execute via Supabase SQL Editor
--
-- 3. After operators are created:
--    - Copy operator UUIDs from bus_operators table
--    - Replace 'OPERATOR_UUID_1', 'OPERATOR_UUID_2' in buses and routes INSERTs
--    - Uncomment and execute
--
-- 4. For schedules:
--    - Use the SELECT queries to get route and bus UUIDs
--    - Or manually replace UUIDs after creating routes and buses
--    - Uncomment and execute

-- ============================================
-- QUICK REFERENCE: Current Schema Fields
-- ============================================
-- buses: bus_number, plate_number, bus_type, total_seats, amenities[], seat_layout, is_active
-- routes: departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km
-- schedules: route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats
-- bookings: schedule_id, seat_numbers[], boarding_point, drop_off_point, passenger_name, passenger_phone, passenger_email
-- bus_operators: company_name, logo_url, status (approved = verified), phone, email, address

