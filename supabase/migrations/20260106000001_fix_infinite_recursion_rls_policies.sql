-- Fix infinite recursion in RLS policies
-- The issue: policies checking profiles.role cause recursion when profiles policies also check profiles
-- Solution: Create a SECURITY DEFINER function that checks profiles.role but bypasses RLS
-- This prevents infinite recursion because the function runs with elevated privileges

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = 'admin'::user_role
  )
$$;

-- Drop all problematic policies that check profiles.role directly
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage operators" ON public.bus_operators;
DROP POLICY IF EXISTS "Admins can manage all buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can manage all cancellations" ON public.cancellations;
DROP POLICY IF EXISTS "Admins can update commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admins can view all commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.schedules;

-- Recreate all policies using is_admin function (SECURITY DEFINER bypasses RLS - no recursion!)
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage operators" ON public.bus_operators
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all buses" ON public.buses
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all cancellations" ON public.cancellations
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update commissions" ON public.commissions
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all commissions" ON public.commissions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all routes" ON public.routes
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all schedules" ON public.schedules
  FOR ALL USING (public.is_admin(auth.uid()));

