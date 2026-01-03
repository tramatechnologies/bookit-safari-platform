-- Add strategic indexes for performance optimization
-- These indexes improve query performance for common operations

-- Index for user's bookings with date filtering (for dashboard, my bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_user_created 
ON public.bookings(user_id, created_at DESC);

-- Index for operator's trips by schedule and date (for trip management, real-time)
CREATE INDEX IF NOT EXISTS idx_trips_schedule_date 
ON public.trips(schedule_id, trip_date);

-- Index for active schedules by route (for route-based queries)
CREATE INDEX IF NOT EXISTS idx_schedules_route_active 
ON public.schedules(route_id, is_active) 
WHERE is_active = true;

-- Index for payment lookups by booking (for payment history, receipts)
CREATE INDEX IF NOT EXISTS idx_payments_booking_created 
ON public.payments(booking_id, created_at DESC);

-- Index for faster booking status queries (for statistics, analytics)
CREATE INDEX IF NOT EXISTS idx_bookings_status_created 
ON public.bookings(status, created_at DESC);

-- Index for trip availability queries (for real-time seat counts)
CREATE INDEX IF NOT EXISTS idx_trips_status_available_seats 
ON public.trips(schedule_id, status, available_seats) 
WHERE status IN ('scheduled', 'in_progress');

-- Index for passenger lookups (for e-ticket generation, manifests)
CREATE INDEX IF NOT EXISTS idx_passengers_booking_seat 
ON public.passengers(booking_id, seat_number);

-- Index for commission calculations (for operator revenue)
CREATE INDEX IF NOT EXISTS idx_commissions_operator_period 
ON public.commissions(operator_id, created_at DESC);

-- Add comment explaining the purpose of these indexes
COMMENT ON INDEX idx_bookings_user_created IS 'Used for user dashboard and my bookings queries';
COMMENT ON INDEX idx_trips_schedule_date IS 'Used for real-time trip management and seat availability queries';
COMMENT ON INDEX idx_schedules_route_active IS 'Used for filtering active schedules by route';
COMMENT ON INDEX idx_payments_booking_created IS 'Used for payment history and receipt generation';
COMMENT ON INDEX idx_bookings_status_created IS 'Used for booking statistics and analytics';
COMMENT ON INDEX idx_trips_status_available_seats IS 'Used for real-time seat availability queries';
COMMENT ON INDEX idx_passengers_booking_seat IS 'Used for e-ticket generation and manifests';
COMMENT ON INDEX idx_commissions_operator_period IS 'Used for operator revenue and commission calculations';
