import { Request } from 'express';
import { User as PrismaUser, Event as PrismaEvent, Registration as PrismaRegistration } from '@prisma/client';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  user?: JwtPayload;
}

export type User = PrismaUser;
export type Event = PrismaEvent;
export type Registration = PrismaRegistration;
