-- Update get_active_schedules to support region filtering
DROP FUNCTION IF EXISTS public.get_active_schedules(date, numeric, numeric);

CREATE OR REPLACE FUNCTION public.get_active_schedules(
  p_departure_date date DEFAULT CURRENT_DATE,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_departure_region_id uuid DEFAULT NULL,
  p_destination_region_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  route_id uuid,
  bus_id uuid,
  departure_date date,
  departure_time time without time zone,
  arrival_time time without time zone,
  price_tzs numeric,
  available_seats integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.route_id,
    s.bus_id,
    s.departure_date,
    s.departure_time,
    s.arrival_time,
    s.price_tzs,
    s.available_seats,
    s.is_active,
    s.created_at,
    s.updated_at
  FROM schedules s
  JOIN routes r ON s.route_id = r.id
  WHERE s.is_active = true
    AND r.is_active = true
    AND s.departure_date >= p_departure_date
    AND (p_min_price IS NULL OR s.price_tzs >= p_min_price)
    AND (p_max_price IS NULL OR s.price_tzs <= p_max_price)
    AND (p_departure_region_id IS NULL OR r.departure_region_id = p_departure_region_id)
    AND (p_destination_region_id IS NULL OR r.destination_region_id = p_destination_region_id)
  ORDER BY s.departure_time ASC;
END;
$$;

