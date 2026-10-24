import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const paymentInitiationSchema = z.object({
  billId: z.string().min(1, 'Target bill ID is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'AUTO_DEBIT']),
  idempotencyKey: z.string().optional(),
});

export const webhookPayloadSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string().optional(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        method: z.string().optional(),
        error_code: z.string().optional(),
        error_description: z.string().optional(),
      }),
    }),
  }),
});

export const ticketSubmissionSchema = z.object({
  utilityType: z.enum(['ELECTRICITY', 'WATER', 'BOTH']),
  category: z.enum([
    'POWER_CUT',
    'VOLTAGE_FLUCTUATION',
    'INFRASTRUCTURE_DAMAGE',
    'WATER_INTERRUPTION',
    'LOW_PRESSURE',
    'WATER_LEAKAGE',
    'METER_PROBLEM',
    'INCORRECT_BILL',
    'PAYMENT_PROBLEM',
    'OTHER',
  ]),
  description: z
    .string()
    .min(15, 'Please provide at least 15 characters describing the issue')
    .max(2000, 'Description cannot exceed 2000 characters'),
  serviceAddress: z.string().min(8, 'Please provide the service premises address'),
  landmark: z.string().max(100).optional(),
  contactPhone: z.string().min(10, 'Contact phone must be at least 10 digits').optional().or(z.literal('')),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contactPreference: z.enum(['SMS', 'EMAIL', 'PHONE']).default('SMS'),
  utilityAccountId: z.string().optional(),
  photoUrl: z.string().url('Invalid photo URL').optional().or(z.literal('')),
});

export const ticketCommentSchema = z.object({
  comment: z.string().min(2, 'Comment cannot be blank').max(1000, 'Comment too long'),
  isInternal: z.boolean().default(false),
});

export const ticketStatusUpdateSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'RESOLVED',
    'CLOSED',
  ]),
  note: z.string().min(5, 'Please include a status change note (minimum 5 characters)'),
  assignedToId: z.string().optional(),
});

export const serviceAlertSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  message: z.string().min(10, 'Alert message must be descriptive'),
  utilityType: z.enum(['ELECTRICITY', 'WATER', 'ALL']),
  severity: z.enum(['CRITICAL', 'WARNING', 'ADVISORY', 'INFO']),
  affectedAreas: z.string().min(3, 'Specify affected localities or feeders'),
  estimatedRestoration: z.string().optional(),
  verifiedSource: z.string().min(3, 'Verified official source is required'),
});

export const supportRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject is required'),
  category: z.string().min(2, 'Category is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const cookieConsentSchema = z.object({
  analyticsConsent: z.boolean(),
  functionalConsent: z.boolean(),
  marketingConsent: z.boolean(),
});
