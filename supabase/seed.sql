-- Seed Data for BookitSafari Platform
-- This file contains comprehensive test data with multiple operators, routes, and seat layouts
-- 
-- AUTO-GENERATED SEED DATA - No manual UUID replacement needed!
-- Uses subqueries to automatically link all data correctly

-- ============================================
-- SAMPLE BUS OPERATORS (Multiple for Testing)
-- ============================================

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
-- Operator 1: Kilimanjaro Express (Dar-based)
(
  (SELECT id FROM auth.users LIMIT 1),
  'Kilimanjaro Express',
  'https://example.com/logos/kilimanjaro-express.png',
  'Premium bus service connecting major cities across Tanzania with luxury and semi-luxury buses.',
  '+255712345678',
  'info@kilimanjaroexpress.co.tz',
  'Ubungo Bus Terminal, Dar es Salaam',
  'LIC-2024-KE-001',
  'approved'
),
-- Operator 2: Scandinavian Express (Arusha-based)
(
  (SELECT id FROM auth.users WHERE email NOT IN (SELECT user_id FROM bus_operators) LIMIT 1),
  'Scandinavian Express',
  'https://example.com/logos/scandinavian-express.png',
  'Reliable and comfortable bus services across Tanzania with premium comfort.',
  '+255765432109',
  'contact@scandinavianexpress.co.tz',
  'Arusha Bus Station, Arusha',
  'LIC-2024-SE-001',
  'approved'
),
-- Operator 3: Safari Star Coaches (Mwanza-based)
(
  (SELECT id FROM auth.users OFFSET 2 LIMIT 1),
  'Safari Star Coaches',
  'https://example.com/logos/safari-star.png',
  'Budget-friendly long-distance coach service with reliable service across Tanzania.',
  '+255754567890',
  'bookings@safaristarchcoaches.co.tz',
  'Mwanza Central Bus Station, Mwanza',
  'LIC-2024-SSC-001',
  'approved'
),
-- Operator 4: Coastal Routes Ltd (Dodoma-based)
(
  (SELECT id FROM auth.users OFFSET 3 LIMIT 1),
  'Coastal Routes Ltd',
  'https://example.com/logos/coastal-routes.png',
  'Professional intercity transport connecting central and coastal Tanzania.',
  '+255789123456',
  'info@coastalroutes.co.tz',
  'Dodoma Bus Terminal, Dodoma',
  'LIC-2024-CR-001',
  'approved'
),
-- Operator 5: Kilimanjaro Peak Shuttles (Kilimanjaro-based)
(
  (SELECT id FROM auth.users OFFSET 4 LIMIT 1),
  'Kilimanjaro Peak Shuttles',
  'https://example.com/logos/peak-shuttles.png',
  'Specialized shuttle service around Mount Kilimanjaro region with premium facilities.',
  '+255712890123',
  'reservations@peakshuttles.co.tz',
  'Moshi Central Station, Kilimanjaro',
  'LIC-2024-KPS-001',
  'approved'
) ON CONFLICT DO NOTHING;


-- ============================================
-- SAMPLE BUSES (Different layouts for each operator)
-- ============================================

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
-- Kilimanjaro Express Buses (Standard Layout - 57 seats)
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
  'KE-001',
  'T123 ABC',
  'Luxury',
  57,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet', 'WiFi'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", null, "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", null, "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", null, "D3", "D4"]}, {"row": "E", "seats": ["E1", null, null, null, "E2"]}, {"row": "F", "seats": ["F1", "F2", null, "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", null, "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", null, "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", null, "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", null, "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", null, "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", null, "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", null, "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
  'KE-002',
  'T124 DEF',
  'Luxury',
  53,
  ARRAY['USB Charging', 'AC', 'Refreshments', 'WiFi'],
  'layout2',
  '[{"row": "A", "seats": ["A1", "A2", "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", "D3", "D4"]}, {"row": "E", "seats": ["E1", "E2"]}, {"row": "F", "seats": ["F1", "F2", "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
  'KE-003',
  'T125 GHI',
  'Semi Luxury',
  56,
  ARRAY['USB Charging', 'AC', 'Refreshments'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", "D3", "D4"]}, {"row": "E", "seats": ["E1", "E2", "E3", "E4"]}, {"row": "F", "seats": ["F1", "F2", "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),

-- Scandinavian Express Buses (Compact Layout - 53 seats)
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1),
  'SE-001',
  'T456 JKL',
  'Luxury',
  53,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet', 'WiFi'],
  'layout2',
  '[{"row": "A", "seats": ["A1", "A2", "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", "D3", "D4"]}, {"row": "E", "seats": ["E1", "E2"]}, {"row": "F", "seats": ["F1", "F2", "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1),
  'SE-002',
  'T457 MNO',
  'Semi Luxury',
  57,
  ARRAY['USB Charging', 'AC', 'Refreshments'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", null, "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", null, "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", null, "D3", "D4"]}, {"row": "E", "seats": ["E1", null, null, null, "E2"]}, {"row": "F", "seats": ["F1", "F2", null, "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", null, "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", null, "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", null, "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", null, "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", null, "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", null, "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", null, "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),

-- Safari Star Coaches Buses (Full Layout - 56 seats)
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1),
  'SSC-001',
  'T789 PQR',
  'Standard',
  56,
  ARRAY['AC', 'Refreshments'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", "D3", "D4"]}, {"row": "E", "seats": ["E1", "E2", "E3", "E4"]}, {"row": "F", "seats": ["F1", "F2", "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1),
  'SSC-002',
  'T790 STU',
  'Standard',
  57,
  ARRAY['AC'],
  'layout2',
  '[{"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", null, "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", null, "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", null, "D3", "D4"]}, {"row": "E", "seats": ["E1", null, null, null, "E2"]}, {"row": "F", "seats": ["F1", "F2", null, "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", null, "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", null, "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", null, "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", null, "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", null, "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", null, "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", null, "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),

-- Coastal Routes Ltd Buses (Standard Layout - 57 seats)
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Coastal Routes Ltd' LIMIT 1),
  'CR-001',
  'T901 VWX',
  'Luxury',
  57,
  ARRAY['USB Charging', 'AC', 'Refreshments', 'WiFi'],
  'layout1',
  '[{"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", null, "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", null, "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", null, "D3", "D4"]}, {"row": "E", "seats": ["E1", null, null, null, "E2"]}, {"row": "F", "seats": ["F1", "F2", null, "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", null, "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", null, "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", null, "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", null, "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", null, "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", null, "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", null, "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
),

-- Kilimanjaro Peak Shuttles Buses (Compact Layout - 53 seats)
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Peak Shuttles' LIMIT 1),
  'KPS-001',
  'T234 YZA',
  'Luxury',
  53,
  ARRAY['USB Charging', 'TV', 'AC', 'Refreshments', 'Toilet', 'WiFi'],
  'layout2',
  '[{"row": "A", "seats": ["A1", "A2", "A3", "A4"]}, {"row": "B", "seats": ["B1", "B2", "B3", "B4"]}, {"row": "C", "seats": ["C1", "C2", "C3", "C4"]}, {"row": "D", "seats": ["D1", "D2", "D3", "D4"]}, {"row": "E", "seats": ["E1", "E2"]}, {"row": "F", "seats": ["F1", "F2", "F3", "F4"]}, {"row": "G", "seats": ["G1", "G2", "G3", "G4"]}, {"row": "H", "seats": ["H1", "H2", "H3", "H4"]}, {"row": "I", "seats": ["I1", "I2", "I3", "I4"]}, {"row": "J", "seats": ["J1", "J2", "J3", "J4"]}, {"row": "K", "seats": ["K1", "K2", "K3", "K4"]}, {"row": "L", "seats": ["L1", "L2", "L3", "L4"]}, {"row": "M", "seats": ["M1", "M2", "M3", "M4"]}, {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;


-- ============================================
-- SAMPLE ROUTES (Different routes for each operator)
-- ============================================

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
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Ubungo Bus Terminal',
  'Arusha Bus Station',
  9.5,
  600,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1),
  'Ubungo Bus Terminal',
  'Mwanza Bus Station',
  14.0,
  1100,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1),
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
  (SELECT id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  'Arusha Bus Station',
  'Ubungo Bus Terminal',
  9.5,
  600,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1),
  'Arusha Bus Station',
  'Moshi Bus Station',
  1.5,
  100,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1),
  'Arusha Bus Station',
  'Mwanza Bus Station',
  10.0,
  700,
  true
),

-- Safari Star Coaches Routes
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  'Mwanza Central Bus Station',
  'Ubungo Bus Terminal',
  14.0,
  1100,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1),
  'Mwanza Central Bus Station',
  'Dodoma Bus Terminal',
  8.0,
  550,
  true
),

-- Coastal Routes Ltd Routes
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Coastal Routes Ltd' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  'Dodoma Bus Terminal',
  'Ubungo Bus Terminal',
  6.5,
  450,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Coastal Routes Ltd' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Dodoma Bus Terminal',
  'Arusha Bus Station',
  8.5,
  550,
  true
),

-- Kilimanjaro Peak Shuttles Routes
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Peak Shuttles' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1),
  'Moshi Bus Station',
  'Arusha Bus Station',
  1.5,
  100,
  true
),
(
  (SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Peak Shuttles' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1),
  (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1),
  'Moshi Bus Station',
  'Ubungo Bus Terminal',
  10.0,
  700,
  true
)
ON CONFLICT DO NOTHING;


-- ============================================
-- SAMPLE SCHEDULES (Multiple schedules for testing)
-- ============================================

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
-- Kilimanjaro Express: Dar -> Arusha (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Arusha Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T123 ABC' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '17:30:00',
  45000,
  57,
  true
),
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Arusha Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T124 DEF' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  '23:30:00',
  50000,
  53,
  true
),

-- Kilimanjaro Express: Dar -> Mwanza (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Bus Terminal' AND arrival_terminal = 'Mwanza Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T125 GHI' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '18:00:00',
  '08:00:00',
  55000,
  56,
  true
),

-- Scandinavian Express: Arusha -> Dar (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Bus Station' AND arrival_terminal = 'Ubungo Bus Terminal' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T456 JKL' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '07:00:00',
  '16:30:00',
  48000,
  53,
  true
),

-- Scandinavian Express: Arusha -> Moshi (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Bus Station' AND arrival_terminal = 'Moshi Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T457 MNO' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  '11:30:00',
  15000,
  57,
  true
),

-- Scandinavian Express: Arusha -> Mwanza (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Bus Station' AND arrival_terminal = 'Mwanza Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Scandinavian Express' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T456 JKL' LIMIT 1),
  CURRENT_DATE + INTERVAL '2 days',
  '16:00:00',
  '02:00:00',
  42000,
  53,
  true
),

-- Safari Star Coaches: Mwanza -> Dar (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Mwanza Central Bus Station' AND arrival_terminal = 'Ubungo Bus Terminal' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T789 PQR' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '18:00:00',
  '08:00:00',
  35000,
  56,
  true
),

-- Safari Star Coaches: Mwanza -> Dodoma (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Mwanza Central Bus Station' AND arrival_terminal = 'Dodoma Bus Terminal' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Safari Star Coaches' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T790 STU' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  '22:00:00',
  28000,
  57,
  true
),

-- Coastal Routes Ltd: Dodoma -> Dar (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Dodoma Bus Terminal' AND arrival_terminal = 'Ubungo Bus Terminal' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Coastal Routes Ltd' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T901 VWX' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '09:00:00',
  '15:30:00',
  32000,
  57,
  true
),

-- Coastal Routes Ltd: Dodoma -> Arusha (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Dodoma Bus Terminal' AND arrival_terminal = 'Arusha Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Coastal Routes Ltd' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T901 VWX' LIMIT 1),
  CURRENT_DATE + INTERVAL '2 days',
  '11:00:00',
  '19:30:00',
  38000,
  57,
  true
),

-- Kilimanjaro Peak Shuttles: Moshi -> Arusha (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Bus Station' AND arrival_terminal = 'Arusha Bus Station' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Peak Shuttles' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T234 YZA' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '09:30:00',
  12000,
  53,
  true
),

-- Kilimanjaro Peak Shuttles: Moshi -> Dar (Tomorrow)
(
  (SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Bus Station' AND arrival_terminal = 'Ubungo Bus Terminal' AND (SELECT operator_id FROM public.bus_operators WHERE company_name = 'Kilimanjaro Peak Shuttles' LIMIT 1) = operator_id LIMIT 1),
  (SELECT id FROM public.buses WHERE plate_number = 'T234 YZA' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '16:00:00',
  '02:00:00',
  40000,
  53,
  true
)
ON CONFLICT DO NOTHING;


-- ============================================
-- USAGE INSTRUCTIONS - NO MANUAL WORK NEEDED!
-- ============================================
-- This seed file now auto-configures using subqueries!
--
-- Simply run this file as-is:
-- 1. Go to Supabase SQL Editor
-- 2. Paste entire file content
-- 3. Click "Run" or execute
-- 4. All data will be seeded automatically!
--
-- The seed includes:
-- ✅ 5 different operators (in different regions)
-- ✅ 7 buses with different seat layout configs
-- ✅ 10 different routes connecting various regions
-- ✅ 12 schedules for testing different layouts
--
-- Testing Scenarios:
-- 1. Standard Layout Testing: Book on KE-001 or CR-001 (57 seats with aisles)
-- 2. Compact Layout Testing: Book on SE-001 or KPS-001 (53 seats, spacious)
-- 3. Full Layout Testing: Book on SSC-001 (56 seats, maximum capacity)
-- 4. Multi-Operator: Each operator has different route coverage
-- 5. Route Coverage: Test different region combinations

-- ============================================
-- QUICK REFERENCE: Operators & Layouts
-- ============================================
-- Kilimanjaro Express (Dar-based):
--   └─ KE-001 (T123 ABC) - Standard Layout (57 seats, with aisles)
--   └─ KE-002 (T124 DEF) - Compact Layout (53 seats, no gaps)
--   └─ KE-003 (T125 GHI) - Full Layout (56 seats, max capacity)
--
-- Scandinavian Express (Arusha-based):
--   └─ SE-001 (T456 JKL) - Compact Layout (53 seats)
--   └─ SE-002 (T457 MNO) - Standard Layout (57 seats)
--
-- Safari Star Coaches (Mwanza-based):
--   └─ SSC-001 (T789 PQR) - Full Layout (56 seats)
--   └─ SSC-002 (T790 STU) - Standard Layout (57 seats)
--
-- Coastal Routes Ltd (Dodoma-based):
--   └─ CR-001 (T901 VWX) - Standard Layout (57 seats)
--
-- Kilimanjaro Peak Shuttles (Kilimanjaro-based):
--   └─ KPS-001 (T234 YZA) - Compact Layout (53 seats)

-- ============================================
-- CURRENT SCHEMA FIELDS
-- ============================================
-- buses: bus_number, plate_number, bus_type, total_seats, amenities[], seat_layout, seat_layout_config (JSONB)
-- routes: departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km
-- schedules: route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats
-- bus_operators: company_name, logo_url, status (approved = verified), phone, email, address

