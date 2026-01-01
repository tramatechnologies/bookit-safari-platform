import { z } from 'zod';

export const operatorInterestSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  description: z.string().optional(),
  licenseNumber: z.string().min(3, 'License number must be at least 3 characters'),
});

export type OperatorInterestInput = z.infer<typeof operatorInterestSchema>;

