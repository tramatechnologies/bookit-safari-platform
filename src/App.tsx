import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SuspenseLoader, LazyIndex, LazyAuth, LazyAuthCallback, LazyVerifyEmail, LazyEmailVerificationWaiting, LazyForgotPassword, LazyResetPassword, LazySearchResults, LazyBooking, LazyPayment, LazyBookingConfirmation, LazyMyBookings, LazyProfile, LazyPassengerDashboard, LazyAdminDashboard, LazyAdminOperators, LazyAdminCommissions, LazyOperatorDashboard, LazyOperatorBuses, LazyOperatorRoutes, LazyOperatorBookings, LazyOperatorSchedules, LazyRoutes, LazyOperators, LazyHelp, LazyAbout, LazyOperatorRegister, LazyPartner, LazyAdvertise, LazyPrivacy, LazyTerms, LazyNotFound } from "@/utils/lazy-load";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - cache time (formerly cacheTime)
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<SuspenseLoader><LazyIndex /></SuspenseLoader>} />
            <Route path="/auth" element={<SuspenseLoader><LazyAuth /></SuspenseLoader>} />
            <Route path="/auth/callback" element={<SuspenseLoader><LazyAuthCallback /></SuspenseLoader>} />
            <Route path="/auth/verify" element={<SuspenseLoader><LazyVerifyEmail /></SuspenseLoader>} />
            <Route path="/auth/verify-waiting" element={<SuspenseLoader><LazyEmailVerificationWaiting /></SuspenseLoader>} />
            <Route path="/forgot-password" element={<SuspenseLoader><LazyForgotPassword /></SuspenseLoader>} />
            <Route path="/auth/reset" element={<SuspenseLoader><LazyResetPassword /></SuspenseLoader>} />
            <Route path="/search" element={<SuspenseLoader><LazySearchResults /></SuspenseLoader>} />
            <Route path="/booking/:scheduleId" element={<SuspenseLoader><LazyBooking /></SuspenseLoader>} />
            <Route path="/booking/:bookingId/payment" element={<SuspenseLoader><LazyPayment /></SuspenseLoader>} />
            <Route path="/booking/:bookingId/confirmation" element={<SuspenseLoader><LazyBookingConfirmation /></SuspenseLoader>} />
            <Route path="/dashboard" element={<SuspenseLoader><LazyPassengerDashboard /></SuspenseLoader>} />
            <Route path="/bookings" element={<SuspenseLoader><LazyMyBookings /></SuspenseLoader>} />
            <Route path="/profile" element={<SuspenseLoader><LazyProfile /></SuspenseLoader>} />
            <Route path="/admin" element={<SuspenseLoader><LazyAdminDashboard /></SuspenseLoader>} />
            <Route path="/admin/operators" element={<SuspenseLoader><LazyAdminOperators /></SuspenseLoader>} />
            <Route path="/admin/commissions" element={<SuspenseLoader><LazyAdminCommissions /></SuspenseLoader>} />
            <Route path="/operator" element={<SuspenseLoader><LazyOperatorDashboard /></SuspenseLoader>} />
            <Route path="/operator/buses" element={<SuspenseLoader><LazyOperatorBuses /></SuspenseLoader>} />
            <Route path="/operator/routes" element={<SuspenseLoader><LazyOperatorRoutes /></SuspenseLoader>} />
            <Route path="/operator/bookings" element={<SuspenseLoader><LazyOperatorBookings /></SuspenseLoader>} />
            <Route path="/operator/schedules/new" element={<SuspenseLoader><LazyOperatorSchedules /></SuspenseLoader>} />
            <Route path="/operator/schedules" element={<SuspenseLoader><LazyOperatorSchedules /></SuspenseLoader>} />
            <Route path="/routes" element={<SuspenseLoader><LazyRoutes /></SuspenseLoader>} />
            <Route path="/operators" element={<SuspenseLoader><LazyOperators /></SuspenseLoader>} />
            <Route path="/help" element={<SuspenseLoader><LazyHelp /></SuspenseLoader>} />
            <Route path="/about" element={<SuspenseLoader><LazyAbout /></SuspenseLoader>} />
            <Route path="/operator/register" element={<SuspenseLoader><LazyOperatorRegister /></SuspenseLoader>} />
            <Route path="/partner" element={<SuspenseLoader><LazyPartner /></SuspenseLoader>} />
            <Route path="/advertise" element={<SuspenseLoader><LazyAdvertise /></SuspenseLoader>} />
            <Route path="/privacy" element={<SuspenseLoader><LazyPrivacy /></SuspenseLoader>} />
            <Route path="/terms" element={<SuspenseLoader><LazyTerms /></SuspenseLoader>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<SuspenseLoader><LazyNotFound /></SuspenseLoader>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
