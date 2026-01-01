import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import EmailVerificationWaiting from "./pages/EmailVerificationWaiting";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SearchResults from "./pages/SearchResults";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOperators from "./pages/AdminOperators";
import AdminCommissions from "./pages/AdminCommissions";
import OperatorDashboard from "./pages/OperatorDashboard";
import RoutesPage from "./pages/Routes";
import Operators from "./pages/Operators";
import Help from "./pages/Help";
import About from "./pages/About";
import OperatorRegister from "./pages/OperatorRegister";
import Partner from "./pages/Partner";
import Advertise from "./pages/Advertise";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/verify" element={<VerifyEmail />} />
          <Route path="/auth/verify-waiting" element={<EmailVerificationWaiting />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/booking/:scheduleId" element={<Booking />} />
            <Route path="/booking/:bookingId/payment" element={<Payment />} />
            <Route path="/booking/:bookingId/confirmation" element={<BookingConfirmation />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/operators" element={<AdminOperators />} />
            <Route path="/admin/commissions" element={<AdminCommissions />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/operators" element={<Operators />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/operator/register" element={<OperatorRegister />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
