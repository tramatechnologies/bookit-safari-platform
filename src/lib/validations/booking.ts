import { z } from 'zod';

export const createBookingSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule ID'),
  passengerName: z.string().min(2, 'Passenger name must be at least 2 characters'),
  passengerPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  passengerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  seatNumbers: z.array(z.number().int().positive()).min(1, 'Please select at least one seat'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

