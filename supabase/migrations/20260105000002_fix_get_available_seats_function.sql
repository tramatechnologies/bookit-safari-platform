-- Fix the get_available_seats function to resolve ambiguous column reference
DROP FUNCTION IF EXISTS public.get_available_seats(uuid);

CREATE OR REPLACE FUNCTION public.get_available_seats(p_schedule_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_seats INTEGER;
  v_booked_seats INTEGER;
BEGIN
  -- Get total seats from bus
  SELECT b.total_seats INTO v_total_seats
  FROM public.schedules s
  JOIN public.buses b ON s.bus_id = b.id
  WHERE s.id = p_schedule_id;
  
  -- Count booked seats (sum of total_seats from each booking)
  SELECT COALESCE(SUM(bk.total_seats), 0) INTO v_booked_seats
  FROM public.bookings bk
  WHERE bk.schedule_id = p_schedule_id
    AND bk.status IN ('pending', 'confirmed');
  
  RETURN COALESCE(v_total_seats, 0) - COALESCE(v_booked_seats, 0);
END;
$$;

