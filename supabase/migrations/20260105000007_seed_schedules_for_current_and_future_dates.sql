-- Add schedules for current date (2026-01-05) and future dates
-- This ensures there are always available schedules to book

-- Insert schedules for 2026-01-05 (copy from 2026-01-04)
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
SELECT 
  route_id,
  bus_id,
  '2026-01-05'::date as departure_date,
  departure_time,
  arrival_time,
  price_tzs,
  available_seats,
  is_active
FROM schedules
WHERE departure_date = '2026-01-04'::date
  AND NOT EXISTS (
    SELECT 1 FROM schedules s2
    WHERE s2.route_id = schedules.route_id
    AND s2.bus_id = schedules.bus_id
    AND s2.departure_date = '2026-01-05'::date
    AND s2.departure_time = schedules.departure_time
  )
ON CONFLICT DO NOTHING;

-- Insert schedules for 2026-01-06 (copy from 2026-01-04)
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
SELECT 
  route_id,
  bus_id,
  '2026-01-06'::date as departure_date,
  departure_time,
  arrival_time,
  price_tzs,
  available_seats,
  is_active
FROM schedules
WHERE departure_date = '2026-01-04'::date
  AND NOT EXISTS (
    SELECT 1 FROM schedules s2
    WHERE s2.route_id = schedules.route_id
    AND s2.bus_id = schedules.bus_id
    AND s2.departure_date = '2026-01-06'::date
    AND s2.departure_time = schedules.departure_time
  )
ON CONFLICT DO NOTHING;

-- Insert schedules for 2026-01-07 (copy from 2026-01-04)
INSERT INTO public.schedules (route_id, bus_id, departure_date, departure_time, arrival_time, price_tzs, available_seats, is_active)
SELECT 
  route_id,
  bus_id,
  '2026-01-07'::date as departure_date,
  departure_time,
  arrival_time,
  price_tzs,
  available_seats,
  is_active
FROM schedules
WHERE departure_date = '2026-01-04'::date
  AND NOT EXISTS (
    SELECT 1 FROM schedules s2
    WHERE s2.route_id = schedules.route_id
    AND s2.bus_id = schedules.bus_id
    AND s2.departure_date = '2026-01-07'::date
    AND s2.departure_time = schedules.departure_time
  )
ON CONFLICT DO NOTHING;