import { z } from 'zod';

export const paymentSchema = z.object({
  paymentMethod: z.enum(['mpesa', 'tigopesa', 'airtel', 'halopesa', 'clickpesa'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').optional(),
}).refine((data) => {
  // Phone number required for mobile money payments
  if (['mpesa', 'tigopesa', 'airtel', 'halopesa'].includes(data.paymentMethod)) {
    return data.phoneNumber && data.phoneNumber.length > 0;
  }
  return true;
}, {
  message: 'Phone number is required for mobile money payments',
  path: ['phoneNumber'],
});

export type PaymentInput = z.infer<typeof paymentSchema>;

