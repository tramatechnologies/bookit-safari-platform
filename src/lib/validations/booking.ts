import { z } from 'zod';

export const passengerInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  category: z.enum(['adult', 'student', 'child'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  age: z.number().int().min(0).max(120).optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
}).refine((data) => {
  // Age is required for children
  if (data.category === 'child') {
    return data.age !== undefined && data.age >= 0 && data.age <= 17;
  }
  return true;
}, {
  message: 'Age is required for children (0-17 years)',
  path: ['age'],
});

export const createBookingSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule ID'),
  passengerName: z.string().min(2, 'Passenger name must be at least 2 characters'),
  passengerPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  passengerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  seatNumbers: z.array(z.number().int().positive()).min(1, 'Please select at least one seat'),
  passengers: z.array(passengerInfoSchema).min(1, 'At least one passenger is required'),
}).refine((data) => {
  // Ensure number of passengers matches number of seats
  return data.passengers.length === data.seatNumbers.length;
}, {
  message: 'Number of passengers must match number of selected seats',
  path: ['passengers'],
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type PassengerInfoInput = z.infer<typeof passengerInfoSchema>;

