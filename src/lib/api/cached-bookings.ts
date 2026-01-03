import { bookingsApi } from './bookings';
import { appCache } from '@/utils/cache';

export const cachedBookingsApi = {
  // Get user's bookings with caching
  async getUserBookings(userId: string): Promise<ReturnType<typeof bookingsApi.getUserBookings>> {
    const cacheKey = `user-bookings-${userId}`;
    
    // Try to get from cache first
    const cached = appCache.get(cacheKey);
    if (cached) {
      console.log('Returning user bookings from cache');
      return cached;
    }
    
    // Fetch fresh data and cache it
    const data = await bookingsApi.getUserBookings(userId);
    appCache.set(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
    
    return data;
  },

  // Get booking by ID with caching
  async getBookingById(bookingId: string, userId: string): Promise<ReturnType<typeof bookingsApi.getBookingById>> {
    const cacheKey = `booking-${bookingId}-${userId}`;
    
    // Try to get from cache first
    const cached = appCache.get(cacheKey);
    if (cached) {
      console.log('Returning booking from cache');
      return cached;
    }
    
    // Fetch fresh data and cache it
    const data = await bookingsApi.getBookingById(bookingId, userId);
    if (data) {
      appCache.set(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
    }
    
    return data;
  },

  // Create booking (bypass cache since it's a write operation)
  async createBooking(booking: Parameters<typeof bookingsApi.createBooking>[0]): Promise<ReturnType<typeof bookingsApi.createBooking>> {
    // Create the booking
    const result = await bookingsApi.createBooking(booking);
    
    // Invalidate related caches
    appCache.delete(`user-bookings-${booking.user_id}`);
    
    return result;
  },

  // Cancel booking (bypass cache since it's a write operation)
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<ReturnType<typeof bookingsApi.cancelBooking>> {
    // Cancel the booking
    const result = await bookingsApi.cancelBooking(bookingId, userId, reason);
    
    // Invalidate related caches
    appCache.delete(`user-bookings-${userId}`);
    appCache.delete(`booking-${bookingId}-${userId}`);
    
    return result;
  },
};