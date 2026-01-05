-- Comprehensive Seed Data for BookitSafari Platform
-- 13 New Operators with Multiple Routes and Schedules

-- ============================================
-- 1. SHABIBY LINE
-- ============================================
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Shabiby Line',
  'https://example.com/logos/shabiby-line.png',
  'info@shababyline.co.tz',
  '+255712345678',
  'Dar es Salaam Bus Terminal',
  'LIC-2024-SB-001',
  'approved'
);

-- 2. BM LUXURY COACH
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'BM Luxury Coach',
  'https://example.com/logos/bm-luxury.png',
  'contact@bmluxury.co.tz',
  '+255765432109',
  'Arusha Central Station',
  'LIC-2024-BM-001',
  'approved'
);

-- 3. ESTHER LUXURY COACH
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Esther Luxury Coach',
  'https://example.com/logos/esther-luxury.png',
  'info@estherluxury.co.tz',
  '+255754567890',
  'Mwanza Bus Station',
  'LIC-2024-EL-001',
  'approved'
);

-- 4. TILISHO SAFARIS
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Tilisho Safaris',
  'https://example.com/logos/tilisho-safaris.png',
  'bookings@tilishosafaris.co.tz',
  '+255789123456',
  'Kilimanjaro Bus Terminal',
  'LIC-2024-TS-001',
  'approved'
);

-- 5. ABC UPPER CLASS
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'ABC Upper Class',
  'https://example.com/logos/abc-upper.png',
  'reservations@abcupperclass.co.tz',
  '+255712890123',
  'Dodoma Bus Terminal',
  'LIC-2024-ABC-001',
  'approved'
);

-- 6. HAPPY NATION
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Happy Nation',
  'https://example.com/logos/happy-nation.png',
  'info@happynation.co.tz',
  '+255723456789',
  'Iringa Central Bus Station',
  'LIC-2024-HN-001',
  'approved'
);

-- 7. KATARAMA LUXURY
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Katarama Luxury',
  'https://example.com/logos/katarama.png',
  'luxury@katarama.co.tz',
  '+255734567890',
  'Mbeya Bus Terminal',
  'LIC-2024-KL-001',
  'approved'
);

-- 8. ALLY'S STAR
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Ally''s Star',
  'https://example.com/logos/allys-star.png',
  'contact@allysstar.co.tz',
  '+255745678901',
  'Morogoro Bus Terminal',
  'LIC-2024-AS-001',
  'approved'
);

-- 9. ABOOD
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Abood',
  'https://example.com/logos/abood.png',
  'info@abood.co.tz',
  '+255756789012',
  'Tanga Bus Terminal',
  'LIC-2024-AB-001',
  'approved'
);

-- 10. KILIMANJARO
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Kilimanjaro',
  'https://example.com/logos/kilimanjaro.png',
  'travel@kilimanjaro.co.tz',
  '+255767890123',
  'Moshi Bus Terminal',
  'LIC-2024-KM-001',
  'approved'
);

-- 12. ADVENTURE
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  company_email,
  company_phone,
  address,
  license_number,
  status
) VALUES (
  'Adventure',
  'https://example.com/logos/adventure.png',
  'bookings@adventurecoach.co.tz',
  '+255790123456',
  'Kigoma Bus Terminal',
  'LIC-2024-ADV-001',
  'approved'
);

-- ============================================
-- BUSES FOR EACH OPERATOR
-- ============================================

-- Shabiby Line Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), 'SB-001', 'T001 SBL', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), 'SB-002', 'T002 SBL', 'Semi Luxury', 53, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet'], 'layout2', true);

-- BM Luxury Coach Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), 'BM-001', 'T003 BML', 'Luxury', 53, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments', 'Reading Light'], 'layout2', true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), 'BM-002', 'T004 BML', 'Luxury', 56, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Esther Luxury Coach Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), 'EL-001', 'T005 ELC', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Tilisho Safaris Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), 'TS-001', 'T006 TSF', 'Semi Luxury', 56, ARRAY['AC', 'WiFi', 'Toilet', 'Refreshments', 'Safari Guide'], 'layout1', true);

-- ABC Upper Class Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), 'ABC-001', 'T007 ABC', 'Luxury', 53, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout2', true);

-- Happy Nation Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), 'HN-001', 'T008 HPN', 'Semi Luxury', 56, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet'], 'layout1', true);

-- Katarama Luxury Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), 'KL-001', 'T009 KTM', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments', 'Reading Light', 'Pillow'], 'layout1', true);

-- Ally's Star Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), 'AS-001', 'T010 ALS', 'Semi Luxury', 56, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Abood Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), 'AB-001', 'T011 ABD', 'Standard', 57, ARRAY['AC', 'WiFi', 'Toilet'], 'layout1', true);

-- Kilimanjaro Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), 'KM-001', 'T012 KLM', 'Semi Luxury', 53, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout2', true);

-- Tahmeed Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), 'TH-001', 'T013 THM', 'Luxury', 56, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Saratoga Line Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), 'SL-001', 'T014 SLN', 'Semi Luxury', 57, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Adventure Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), 'ADV-001', 'T015 ADV', 'Semi Luxury', 56, ARRAY['AC', 'WiFi', 'Toilet', 'Refreshments', 'Adventure Kit'], 'layout1', true);

-- ============================================
-- ROUTES FOR EACH OPERATOR
-- ============================================

-- Shabiby Line Routes (Dar-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Ubungo Terminal', 'Arusha Station', 9.5, 600, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), 'Ubungo Terminal', 'Morogoro Station', 2.5, 190, true);

-- BM Luxury Coach Routes (Arusha-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), 'Arusha Station', 'Moshi Terminal', 1.5, 100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Arusha Station', 'Ubungo Terminal', 9.5, 600, true);

-- Esther Luxury Coach Routes (Mwanza-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Mwanza Terminal', 'Ubungo Terminal', 14.0, 1100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Mwanza Terminal', 'Dodoma Station', 8.0, 550, true);

-- Tilisho Safaris Routes (Kilimanjaro-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Moshi Terminal', 'Arusha Station', 1.5, 100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), 'Moshi Terminal', 'Tanga Terminal', 5.0, 350, true);

-- ABC Upper Class Routes (Dodoma-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Dodoma Station', 'Ubungo Terminal', 6.5, 450, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Dodoma Station', 'Iringa Terminal', 5.0, 350, true);

-- Happy Nation Routes (Iringa-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), 'Iringa Terminal', 'Mbeya Terminal', 3.5, 250, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Iringa Terminal', 'Dodoma Station', 5.0, 350, true);

-- Katarama Luxury Routes (Mbeya-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Mbeya Terminal', 'Iringa Terminal', 3.5, 250, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Mbeya Terminal', 'Ubungo Terminal', 18.0, 1400, true);

-- Ally's Star Routes (Morogoro-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Morogoro Station', 'Ubungo Terminal', 2.5, 190, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Morogoro Station', 'Iringa Terminal', 8.0, 600, true);

-- Abood Routes (Tanga-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), 'Tanga Terminal', 'Moshi Terminal', 5.0, 350, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Tanga Terminal', 'Ubungo Terminal', 12.0, 900, true);

-- Kilimanjaro Routes (Moshi-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Moshi' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Moshi Terminal', 'Arusha Station', 2.0, 140, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Moshi' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Moshi Terminal', 'Ubungo Terminal', 10.0, 700, true);

-- Tahmeed Routes (Zanzibar-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Zanzibar' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Stone Town Ferry', 'Ubungo Terminal', 1.0, 50, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Zanzibar' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Pwani' LIMIT 1), 'Stone Town Ferry', 'Pwani Terminal', 4.0, 280, true);

-- Saratoga Line Routes (Singida-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Singida' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Singida Station', 'Dodoma Station', 2.5, 180, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Singida' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Singida Station', 'Ubungo Terminal', 9.0, 650, true);

-- Adventure Routes (Kigoma-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kigoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tabora' LIMIT 1), 'Kigoma Terminal', 'Tabora Station', 6.0, 450, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kigoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), 'Kigoma Terminal', 'Mwanza Terminal', 8.0, 600, true);

-- ============================================
-- SCHEDULES FOR EACH ROUTE
-- ============================================

-- Shabiby Line Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T001 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '17:30:00', 45000, 57, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T002 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '14:00:00', '23:30:00', 42000, 53, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Morogoro Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T001 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:30:00', 15000, 57, true);

-- BM Luxury Coach Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Station' AND arrival_terminal = 'Moshi Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T003 BML' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:30:00', 18000, 53, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T004 BML' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '07:00:00', '16:30:00', 48000, 56, true);

-- Esther Luxury Coach Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Mwanza Terminal' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T005 ELC' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '18:00:00', '08:00:00', 55000, 57, true);

-- Tilisho Safaris Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T006 TSF' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '10:00:00', 16000, 56, true);

-- ABC Upper Class Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Dodoma Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T007 ABC' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00:00', '15:30:00', 32000, 53, true);

-- Happy Nation Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Iringa Terminal' AND arrival_terminal = 'Mbeya Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T008 HPN' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '13:30:00', 28000, 56, true);

-- Katarama Luxury Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Mbeya Terminal' AND arrival_terminal = 'Iringa Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T009 KTM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '11:30:00', 30000, 57, true);

-- Ally's Star Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Morogoro Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T010 ALS' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '11:00:00', '13:30:00', 18000, 56, true);

-- Abood Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Tanga Terminal' AND arrival_terminal = 'Moshi Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T011 ABD' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '12:00:00', '17:00:00', 25000, 57, true);

-- Kilimanjaro Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T012 KLM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:00:00', 15000, 53, true);

-- Tahmeed Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Stone Town Ferry' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T013 THM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '06:00:00', '07:00:00', 12000, 56, true);

-- Saratoga Line Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Singida Station' AND arrival_terminal = 'Dodoma Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T014 SLN' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '13:00:00', '15:30:00', 22000, 57, true);

-- Adventure Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Kigoma Terminal' AND arrival_terminal = 'Mwanza Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T015 ADV' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '16:00:00', '00:00:00', 38000, 56, true);

-- 2. BM LUXURY COACH
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'BM Luxury Coach',
  'https://example.com/logos/bm-luxury.png',
  'Luxury coach services with VIP amenities across Tanzania',
  '+255765432109',
  'contact@bmluxury.co.tz',
  'Arusha Central Station',
  'LIC-2024-BM-001',
  'approved'
);

-- 3. ESTHER LUXURY COACH
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Esther Luxury Coach',
  'https://example.com/logos/esther-luxury.png',
  'Premium long-distance coaching with comfort and reliability',
  '+255754567890',
  'info@estherluxury.co.tz',
  'Mwanza Bus Station',
  'LIC-2024-EL-001',
  'approved'
);

-- 4. TILISHO SAFARIS
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Tilisho Safaris',
  'https://example.com/logos/tilisho-safaris.png',
  'Safari-focused transport connecting tourist destinations',
  '+255789123456',
  'bookings@tilishosafaris.co.tz',
  'Kilimanjaro Bus Terminal',
  'LIC-2024-TS-001',
  'approved'
);

-- 5. ABC UPPER CLASS
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'ABC Upper Class',
  'https://example.com/logos/abc-upper.png',
  'Upper class travel experience with premium services',
  '+255712890123',
  'reservations@abcupperclass.co.tz',
  'Dodoma Bus Terminal',
  'LIC-2024-ABC-001',
  'approved'
);

-- 6. HAPPY NATION
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Happy Nation',
  'https://example.com/logos/happy-nation.png',
  'Friendly and reliable transport connecting communities',
  '+255723456789',
  'info@happynation.co.tz',
  'Iringa Central Bus Station',
  'LIC-2024-HN-001',
  'approved'
);

-- 7. KATARAMA LUXURY
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Katarama Luxury',
  'https://example.com/logos/katarama.png',
  'Luxury travel with exclusive amenities and premium comfort',
  '+255734567890',
  'luxury@katarama.co.tz',
  'Mbeya Bus Terminal',
  'LIC-2024-KL-001',
  'approved'
);

-- 8. ALLY'S STAR
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Ally''s Star',
  'https://example.com/logos/allys-star.png',
  'Stellar service with modern buses and professional drivers',
  '+255745678901',
  'contact@allysstar.co.tz',
  'Morogoro Bus Terminal',
  'LIC-2024-AS-001',
  'approved'
);

-- 9. ABOOD
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Abood',
  'https://example.com/logos/abood.png',
  'Reliable intercity transport with competitive fares',
  '+255756789012',
  'info@abood.co.tz',
  'Tanga Bus Terminal',
  'LIC-2024-AB-001',
  'approved'
);

-- 10. KILIMANJARO
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Kilimanjaro',
  'https://example.com/logos/kilimanjaro.png',
  'Mountain region specialist connecting Kilimanjaro with major cities',
  '+255767890123',
  'travel@kilimanjaro.co.tz',
  'Moshi Bus Terminal',
  'LIC-2024-KM-001',
  'approved'
);

-- 11. TAHMEED
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Tahmeed',
  'https://example.com/logos/tahmeed.png',
  'Professional transport services with excellent track record',
  '+255778901234',
  'reservations@tahmeed.co.tz',
  'Zanzibar Ferry Terminal',
  'LIC-2024-TH-001',
  'approved'
);

-- 12. SARATOGA LINE
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Saratoga Line',
  'https://example.com/logos/saratoga.png',
  'Established bus line with nationwide coverage',
  '+255789012345',
  'info@saratogaline.co.tz',
  'Singida Bus Terminal',
  'LIC-2024-SL-001',
  'approved'
);

-- 13. ADVENTURE
INSERT INTO public.bus_operators (
  company_name,
  logo_url,
  description,
  phone,
  email,
  address,
  license_number,
  status
) VALUES (
  'Adventure',
  'https://example.com/logos/adventure.png',
  'Adventure travel company connecting tourist hotspots',
  '+255790123456',
  'bookings@adventurecoach.co.tz',
  'Kigoma Bus Terminal',
  'LIC-2024-ADV-001',
  'approved'
);

-- ============================================
-- BUSES FOR EACH OPERATOR
-- ============================================

-- Shabiby Line Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), 'SB-001', 'T001 SBL', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), 'SB-002', 'T002 SBL', 'Semi Luxury', 53, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet'], 'layout2', true);

-- BM Luxury Coach Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), 'BM-001', 'T003 BML', 'Luxury', 53, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments', 'Reading Light'], 'layout2', true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), 'BM-002', 'T004 BML', 'Luxury', 56, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Esther Luxury Coach Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), 'EL-001', 'T005 ELC', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Tilisho Safaris Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), 'TS-001', 'T006 TSF', 'Semi Luxury', 56, ARRAY['AC', 'WiFi', 'Toilet', 'Refreshments', 'Safari Guide'], 'layout1', true);

-- ABC Upper Class Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), 'ABC-001', 'T007 ABC', 'Luxury', 53, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout2', true);

-- Happy Nation Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), 'HN-001', 'T008 HPN', 'Semi Luxury', 56, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet'], 'layout1', true);

-- Katarama Luxury Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), 'KL-001', 'T009 KTM', 'Luxury', 57, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments', 'Reading Light', 'Pillow'], 'layout1', true);

-- Ally's Star Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), 'AS-001', 'T010 ALS', 'Semi Luxury', 56, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Abood Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), 'AB-001', 'T011 ABD', 'Standard', 57, ARRAY['AC', 'WiFi', 'Toilet'], 'layout1', true);

-- Kilimanjaro Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), 'KM-001', 'T012 KLM', 'Semi Luxury', 53, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout2', true);

-- Tahmeed Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), 'TH-001', 'T013 THM', 'Luxury', 56, ARRAY['USB Charging', 'TV', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Saratoga Line Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), 'SL-001', 'T014 SLN', 'Semi Luxury', 57, ARRAY['USB Charging', 'AC', 'WiFi', 'Toilet', 'Refreshments'], 'layout1', true);

-- Adventure Buses
INSERT INTO public.buses (operator_id, bus_number, plate_number, bus_type, total_seats, amenities, seat_layout, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), 'ADV-001', 'T015 ADV', 'Semi Luxury', 56, ARRAY['AC', 'WiFi', 'Toilet', 'Refreshments', 'Adventure Kit'], 'layout1', true);

-- ============================================
-- ROUTES FOR EACH OPERATOR
-- ============================================

-- Shabiby Line Routes (Dar-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Ubungo Terminal', 'Arusha Station', 9.5, 600, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Shabiby Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), 'Ubungo Terminal', 'Morogoro Station', 2.5, 190, true);

-- BM Luxury Coach Routes (Arusha-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), 'Arusha Station', 'Moshi Terminal', 1.5, 100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'BM Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Arusha Station', 'Ubungo Terminal', 9.5, 600, true);

-- Esther Luxury Coach Routes (Mwanza-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Mwanza Terminal', 'Ubungo Terminal', 14.0, 1100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Esther Luxury Coach' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Mwanza Terminal', 'Dodoma Station', 8.0, 550, true);

-- Tilisho Safaris Routes (Kilimanjaro-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Moshi Terminal', 'Arusha Station', 1.5, 100, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tilisho Safaris' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), 'Moshi Terminal', 'Tanga Terminal', 5.0, 350, true);

-- ABC Upper Class Routes (Dodoma-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Dodoma Station', 'Ubungo Terminal', 6.5, 450, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'ABC Upper Class' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Dodoma Station', 'Iringa Terminal', 5.0, 350, true);

-- Happy Nation Routes (Iringa-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), 'Iringa Terminal', 'Mbeya Terminal', 3.5, 250, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Happy Nation' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Iringa Terminal', 'Dodoma Station', 5.0, 350, true);

-- Katarama Luxury Routes (Mbeya-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Mbeya Terminal', 'Iringa Terminal', 3.5, 250, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Katarama Luxury' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mbeya' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Mbeya Terminal', 'Ubungo Terminal', 18.0, 1400, true);

-- Ally's Star Routes (Morogoro-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Morogoro Station', 'Ubungo Terminal', 2.5, 190, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Ally''s Star' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Morogoro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Iringa' LIMIT 1), 'Morogoro Station', 'Iringa Terminal', 8.0, 600, true);

-- Abood Routes (Tanga-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kilimanjaro' LIMIT 1), 'Tanga Terminal', 'Moshi Terminal', 5.0, 350, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Abood' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tanga' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Tanga Terminal', 'Ubungo Terminal', 12.0, 900, true);

-- Kilimanjaro Routes (Moshi-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Moshi' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Arusha' LIMIT 1), 'Moshi Terminal', 'Arusha Station', 2.0, 140, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Kilimanjaro' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Moshi' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Moshi Terminal', 'Ubungo Terminal', 10.0, 700, true);

-- Tahmeed Routes (Zanzibar-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Zanzibar' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Stone Town Ferry', 'Ubungo Terminal', 1.0, 50, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Tahmeed' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Zanzibar' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Pwani' LIMIT 1), 'Stone Town Ferry', 'Pwani Terminal', 4.0, 280, true);

-- Saratoga Line Routes (Singida-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Singida' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dodoma' LIMIT 1), 'Singida Station', 'Dodoma Station', 2.5, 180, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Saratoga Line' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Singida' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Dar es Salaam' LIMIT 1), 'Singida Station', 'Ubungo Terminal', 9.0, 650, true);

-- Adventure Routes (Kigoma-based)
INSERT INTO public.routes (operator_id, departure_region_id, destination_region_id, departure_terminal, arrival_terminal, duration_hours, distance_km, is_active)
VALUES 
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kigoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Tabora' LIMIT 1), 'Kigoma Terminal', 'Tabora Station', 6.0, 450, true),
  ((SELECT id FROM public.bus_operators WHERE company_name = 'Adventure' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Kigoma' LIMIT 1), (SELECT id FROM public.regions WHERE name = 'Mwanza' LIMIT 1), 'Kigoma Terminal', 'Mwanza Terminal', 8.0, 600, true);

-- ============================================
-- SCHEDULES FOR EACH ROUTE
-- ============================================

-- Shabiby Line Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T001 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '17:30:00', 45000, 57, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T002 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '14:00:00', '23:30:00', 42000, 53, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Ubungo Terminal' AND arrival_terminal = 'Morogoro Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T001 SBL' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:30:00', 15000, 57, true);

-- BM Luxury Coach Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Station' AND arrival_terminal = 'Moshi Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T003 BML' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:30:00', 18000, 53, true),
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Arusha Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T004 BML' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '07:00:00', '16:30:00', 48000, 56, true);

-- Esther Luxury Coach Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Mwanza Terminal' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T005 ELC' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '18:00:00', '08:00:00', 55000, 57, true);

-- Tilisho Safaris Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T006 TSF' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '10:00:00', 16000, 56, true);

-- ABC Upper Class Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Dodoma Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T007 ABC' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00:00', '15:30:00', 32000, 53, true);

-- Happy Nation Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Iringa Terminal' AND arrival_terminal = 'Mbeya Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T008 HPN' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '13:30:00', 28000, 56, true);

-- Katarama Luxury Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Mbeya Terminal' AND arrival_terminal = 'Iringa Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T009 KTM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '11:30:00', 30000, 57, true);

-- Ally's Star Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Morogoro Station' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T010 ALS' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '11:00:00', '13:30:00', 18000, 56, true);

-- Abood Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Tanga Terminal' AND arrival_terminal = 'Moshi Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T011 ABD' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '12:00:00', '17:00:00', 25000, 57, true);

-- Kilimanjaro Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Moshi Terminal' AND arrival_terminal = 'Arusha Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T012 KLM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:00:00', 15000, 53, true);

-- Tahmeed Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Stone Town Ferry' AND arrival_terminal = 'Ubungo Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T013 THM' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '06:00:00', '07:00:00', 12000, 56, true);

-- Saratoga Line Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Singida Station' AND arrival_terminal = 'Dodoma Station' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T014 SLN' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '13:00:00', '15:30:00', 22000, 57, true);

-- Adventure Schedules
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
VALUES 
  ((SELECT id FROM public.routes WHERE departure_terminal = 'Kigoma Terminal' AND arrival_terminal = 'Mwanza Terminal' LIMIT 1), (SELECT id FROM public.buses WHERE plate_number = 'T015 ADV' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '16:00:00', '00:00:00', 38000, 56, true);

