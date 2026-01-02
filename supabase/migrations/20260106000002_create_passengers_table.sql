-- Create passengers table to store individual passenger information for each booking
CREATE TABLE IF NOT EXISTS public.passengers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('adult', 'student', 'child')),
  age INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id, seat_number)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON public.passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_passengers_seat_number ON public.passengers(seat_number);

-- Enable RLS
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for passengers
CREATE POLICY "Users can view passengers for their bookings" ON public.passengers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can create passengers for their bookings" ON public.passengers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all passengers" ON public.passengers
  FOR ALL USING (public.is_admin(auth.uid()));

