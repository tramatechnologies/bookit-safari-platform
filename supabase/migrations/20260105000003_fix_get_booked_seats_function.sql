-- Fix the get_booked_seats function to work with schedules directly (no trips table)
DROP FUNCTION IF EXISTS public.get_booked_seats(uuid, date);

CREATE OR REPLACE FUNCTION public.get_booked_seats(p_schedule_id uuid, p_departure_date date)
RETURNS integer[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_booked_seats INTEGER[];
BEGIN
  -- Get all booked seat numbers for this schedule and date
  -- Bookings are linked directly to schedules which have departure_date
  WITH booked AS (
    SELECT UNNEST(bk.seat_numbers) AS seat_num
    FROM public.bookings bk
    JOIN public.schedules s ON bk.schedule_id = s.id
    WHERE bk.schedule_id = p_schedule_id
      AND s.departure_date = p_departure_date
      AND bk.status IN ('pending', 'confirmed')
  )
  SELECT COALESCE(ARRAY_AGG(DISTINCT seat_num ORDER BY seat_num), ARRAY[]::INTEGER[])
  INTO v_booked_seats
  FROM booked;

  RETURN COALESCE(v_booked_seats, ARRAY[]::INTEGER[]);
END;
$$;

