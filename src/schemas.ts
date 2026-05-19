import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const eventCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().datetime({ message: "Invalid datetime format" }).or(z.date()),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().int().nonnegative('Capacity must be a non-negative integer'),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const registrationSchema = z.object({
  eventId: z.number().int().positive('Invalid event ID'),
});
