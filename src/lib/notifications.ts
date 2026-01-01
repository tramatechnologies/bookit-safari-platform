import { supabase } from '@/integrations/supabase/client';

export interface BookingNotificationData {
  bookingNumber: string;
  passengerName: string;
  passengerEmail: string | null;
  passengerPhone: string;
  route: string;
  date: string;
  time: string;
  seats: number[];
  totalAmount: number;
}

/**
 * Send booking confirmation notification
 * In production, this would integrate with an email service (SendGrid, AWS SES, etc.)
 * or use Supabase Edge Functions for email sending
 */
export const sendBookingConfirmation = async (data: BookingNotificationData) => {
  try {
    // In a real implementation, you would:
    // 1. Call a Supabase Edge Function
    // 2. Or use a third-party email service
    // 3. Or use Supabase's built-in email service (if configured)

    // For now, we'll log the notification data (without sensitive info)
    // In production, replace this with actual email/SMS sending logic
    if (import.meta.env.DEV) {
      console.log('Booking confirmation notification:', {
        to: data.passengerEmail ? `${data.passengerEmail.substring(0, 3)}***` : data.passengerPhone ? `${data.passengerPhone.substring(0, 3)}***` : 'N/A',
        subject: `Booking Confirmation - ${data.bookingNumber}`,
        bookingNumber: data.bookingNumber,
      });
    }

    // Example: Call Supabase Edge Function (if deployed)
    // const { error } = await supabase.functions.invoke('send-booking-email', {
    //   body: data,
    // });
    // if (error) throw error;

    // For SMS, you could integrate with services like:
    // - Twilio
    // - Africa's Talking
    // - ClickPesa SMS API

    return { success: true };
  } catch (error) {
    // Only log in development, don't expose error details in production
    if (import.meta.env.DEV) {
      console.error('Failed to send booking confirmation:', error);
    }
    throw error;
  }
};

/**
 * Send booking cancellation notification
 */
export const sendBookingCancellation = async (data: BookingNotificationData & { reason?: string }) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Booking cancellation notification:', {
        to: data.passengerEmail ? `${data.passengerEmail.substring(0, 3)}***` : data.passengerPhone ? `${data.passengerPhone.substring(0, 3)}***` : 'N/A',
        subject: `Booking Cancelled - ${data.bookingNumber}`,
        bookingNumber: data.bookingNumber,
      });
    }

    return { success: true };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to send cancellation notification:', error);
    }
    throw error;
  }
};

/**
 * Send payment confirmation notification
 */
export const sendPaymentConfirmation = async (data: {
  bookingNumber: string;
  passengerEmail: string | null;
  passengerPhone: string;
  amount: number;
  transactionId: string;
}) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Payment confirmation notification:', {
        to: data.passengerEmail ? `${data.passengerEmail.substring(0, 3)}***` : data.passengerPhone ? `${data.passengerPhone.substring(0, 3)}***` : 'N/A',
        subject: `Payment Confirmed - ${data.bookingNumber}`,
        bookingNumber: data.bookingNumber,
      });
    }

    return { success: true };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to send payment confirmation:', error);
    }
    throw error;
  }
};

