import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
});

export type ProfileInput = z.infer<typeof profileSchema>;

