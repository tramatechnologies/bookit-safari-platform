-- Update get_booked_seats function to only mark seats as booked after payment is completed
-- This ensures seats remain available until payment is successfully completed
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
  -- Only include seats from bookings with at least one completed payment
  WITH completed_payments AS (
    -- Get the most recent completed payment for each booking
    SELECT DISTINCT ON (p.booking_id) p.booking_id
    FROM public.payments p
    WHERE p.status = 'completed'
    ORDER BY p.booking_id, p.completed_at DESC NULLS LAST, p.created_at DESC
  ),
  booked AS (
    SELECT UNNEST(bk.seat_numbers) AS seat_num
    FROM public.bookings bk
    JOIN public.schedules s ON bk.schedule_id = s.id
    INNER JOIN completed_payments cp ON cp.booking_id = bk.id
    WHERE bk.schedule_id = p_schedule_id
      AND s.departure_date = p_departure_date
  )
  SELECT COALESCE(ARRAY_AGG(DISTINCT seat_num ORDER BY seat_num), ARRAY[]::INTEGER[])
  INTO v_booked_seats
  FROM booked;

  RETURN COALESCE(v_booked_seats, ARRAY[]::INTEGER[]);
END;
$$;

