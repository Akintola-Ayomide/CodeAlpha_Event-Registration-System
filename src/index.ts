import dotenv from 'dotenv';
dotenv.config();

// Ensure JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import registrationRoutes from './routes/registrations';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registrations', registrationRoutes);
app.use('/admin', adminRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Event Registration System API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

